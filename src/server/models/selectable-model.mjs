import assert from 'assert';
import pgFormat from 'pg-format';
import {postgresClient} from './index.mjs';

const SAFE_OPS = new Set(['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'SIMILAR TO', 'NOT SIMILAR TO', 'IS', 'IS NOT', 'IS NULL', 'IS NOT NULL', 'IN', 'NOT IN', 'ANY', 'ALL', 'BETWEEN', 'NOT BETWEEN', 'IS DISTINCT FROM', 'IS NOT DISTINCT FROM']);
const isSafeOp = (op) => SAFE_OPS.has(op.toUpperCase());
const SAFE_IDENTIFIERS = new Set(['*', 'RANDOM()']);
const isSafeIdentifier = (identifier) => SAFE_IDENTIFIERS.has(identifier.toUpperCase());
const JSONB_ROOT_COLUMNS = new Set(['metadata', 'metrics']);

class SelectableModel {
    static getTableName() {
        throw new Error('SelectableModel is an abstract class');
    }

    static isJSONBRootColumn(column) {
        return JSONB_ROOT_COLUMNS.has(column);
    }

    static getCanonicalColumn(column) {
        const paths = column.split('.');

        switch (paths[0]) {
        case 'tags':
        case 'predictions':
        case 'groundtruths':
        case 'datapoints':
        case 'feature_vectors':
            return column;
        default:
            return `datapoints.${column}`;
        }
    }

    static getCanonicalFilters(filters) {

        return filters.map((filter) => {
            assert(filter, `${filter} is not a valid filter`);

            return {
                'left': this.getCanonicalColumn(filter['left']),
                'op': filter['op'],
                'right': filter['right']
            };
        });
    }

    static getColumnTable(column) {

        return this.getCanonicalColumn(column).split('.')[0];
    }

    static getColumnName(column) {

        return this.getCanonicalColumn(column).split('.').slice(1).join('.');
    }

    static getSafeColumn(column, withAliasForJSONB = false) {
        const path = column.split('.');
        const isChildOfJSONB = (i) => {
            if (i === 0) {
                return false;
            } else {
                return this.isJSONBRootColumn(path[i - 1]) || isChildOfJSONB(i - 1);
            }
        };

        return pgFormat(
            path.map((c, i) => {

                if (isSafeIdentifier(c)) {
                    return i === 0 ? '%s' : '.%s';
                } else if (isChildOfJSONB(i)) {
                    if (withAliasForJSONB && i === path.length - 1) {
                        return `->>%L AS ${pgFormat.ident(column)}`;
                    } else {
                        return '->>%L';
                    }
                } else {
                    return i === 0 ? '%I' : '.%I';
                }
            }).join(''),
            ...path
        );
    }

    static getSafeWhere(canonicalFilters) {

        return canonicalFilters.map((filter) => {
            const op = filter['op'].toUpperCase();

            assert(isSafeOp(op), `Unsafe op: "${op}"`);

            switch (op) {
            case 'IN':
            case 'NOT IN':
                assert(Array.isArray(filter['right']), `Right side of "${op}" must be an array`);

                if (filter['right'].length === 0) {
                    return op === 'IN' ? 'FALSE' : 'TRUE';
                } else {
                    return `${this.getSafeColumn(filter['left'])} ${op} (${pgFormat.literal(filter['right'])})`;
                }
            default:
                return `${this.getSafeColumn(filter['left'])} ${op} ${pgFormat.literal(filter['right'])}`;
            }
        }).join(' AND ');
    }

    static getSafeJoin(canonicalColumnTables) {

        return `datapoints ${Array.from(new Set(canonicalColumnTables))
            .filter((table) => table !== 'datapoints')
            .map((table) => {
                const [tableName, tableAlias] = table.toLowerCase().split(' as ');

                if (tableAlias) {

                    return pgFormat('LEFT JOIN %I AS %I ON datapoints.id = %I.datapoint', tableName, tableAlias, tableAlias);
                } else {

                    return pgFormat('LEFT JOIN %I ON datapoints.id = %I.datapoint', table, table);
                }
            })
            .join(' ')}`;
    }

    static async findAll(organizationId) {
        const {rows} = await postgresClient.query(
            'SELECT * FROM datapoints WHERE organization_id = $1',
            [organizationId]
        );

        return rows;
    }

    static async findById(organizationId, id) {
        const {rows} = await postgresClient.query(
            'SELECT * FROM datapoints WHERE id = $1 AND organization_id = $2',
            [id, organizationId]
        );

        return rows[0];
    }

    static async count({organizationId, filters = []}) {
        const {rows} = await postgresClient.query(`
            SELECT COUNT(DISTINCT id) as count
            FROM (${this._getSafeSelectQuery({
        selectColumns: ['id'],
        organizationId,
        filters
    })}) AS datapoints
        `);

        return Number(rows[0]['count']);
    }

    static async select(...args) {
        const {rows} = await postgresClient.query(this._getSafeSelectQuery(...args));

        return rows;
    }

    static _getSafeSelectQuery({
        organizationId, selectColumns = [], filters,
        orderBy = 'datapoints.created_at', desc = false, limit = 1000000, offset = 0
    }) {
        assert(organizationId, 'organizationId is required');
        const canonicalSelectColumns = selectColumns.map(this.getCanonicalColumn.bind(this));
        const canonicalFilters = this.getCanonicalFilters(filters.concat({
            'left': 'organization_id',
            'op': '=',
            'right': organizationId
        }));
        const canonicalSelectColumnsPerTable = canonicalSelectColumns.reduce((acc, column) => {
            const tableName = this.getColumnTable(column);

            if (!acc[tableName]) {
                acc[tableName] = [];
            }

            acc[tableName].push(column);

            return acc;
        }, {});
        const safeSelects = Object.entries(canonicalSelectColumnsPerTable).reduce((acc, [tableName, columns]) => {

            if (tableName === 'datapoints') {
                acc.push(...columns.map((c) => this.getSafeColumn(c, true)));
            } else {
                // Aggregate distinct JSONB objects with column values of tableName.
                // Example: JSONB_BUILD_OBJECT('class_name', predictions.class_name, 'confidence', predictions.confidence, ...)
                // Then with ARRAY_REMOVE, remove objects that have only null values.
                // Example: ARRAY_REMOVE(..., '{"class_name": null, "confidence": null, ...}')
                // This would happen if for example there are no predictions for a datapoint so the LEFT JOIN joins predictions.* with all null values.
                acc.push(
                    pgFormat(`
                        ARRAY_REMOVE(
                            ARRAY_AGG(DISTINCT 
                                ${''/* ex: JSONB_BUILD_OBJECT('class_name', predictions.class_name, 'confidence', predictions.confidence, ...)*/}
                                JSONB_BUILD_OBJECT(
                                    ${columns.map((c) => [pgFormat.literal(this.getColumnName(c)), this.getSafeColumn(c, true)]).flat().join(', ')}
                                )
                            ), 
                            ${''/* ex: {"class_name": null, "confidence": null, ...} */}
                            '{${columns.map((c) => pgFormat.literal(this.getColumnName(c)).replaceAll('\'', '')).map((cc) => `"${cc}": null`)}}'
                        ) AS %I`, tableName)
                );
            }

            return acc;
        }, []);
        const canonicalSelectTables = canonicalSelectColumns.map(this.getColumnTable.bind(this));
        const filtersPerColumn = canonicalFilters.reduce((acc, filter) => {
            const column = filter['left'];

            if (!acc[column]) {
                acc[column] = [];
            }

            acc[column].push(filter);

            return acc;
        }, {});
        const aliasedFilters = Object.values(filtersPerColumn).reduce((acc, columnFilters) => {
            if (columnFilters.length > 1) {
                columnFilters.forEach((filter, i) => {
                    const tableName = this.getColumnTable(filter['left']);
                    const columnName = filter['left'].split('.')[1];

                    acc.push({
                        'left': `${tableName}_${i}.${columnName}`,
                        'op': filter['op'],
                        'right': filter['right']
                    });
                });
            } else {
                acc.push(columnFilters[0]);
            }

            return acc;
        }, []);
        const aliasedTables = Object.values(filtersPerColumn).reduce((acc, columnFilters) => {
            if (columnFilters.length > 1) {
                columnFilters.forEach((filter, i) => {
                    const tableName = this.getColumnTable(filter['left']);

                    acc.push(`${tableName} AS ${tableName}_${i}`);
                });
            } else {
                acc.push(this.getColumnTable(columnFilters[0]['left']));
            }

            return acc;
        }, []);

        return `
            SELECT ${safeSelects.join(', ')}
            FROM ${this.getSafeJoin(canonicalSelectTables)}
            WHERE datapoints.id IN (
                SELECT id FROM (
                    SELECT DISTINCT datapoints.id, ${this.getSafeColumn(orderBy)}
                    FROM ${this.getSafeJoin(aliasedTables.concat([this.getColumnTable(orderBy)]))}
                    WHERE ${this.getSafeWhere(aliasedFilters)}
                    GROUP BY datapoints.id
                    ORDER BY ${this.getSafeColumn(orderBy)} ${desc ? 'DESC' : 'ASC'}
                    LIMIT ${pgFormat.literal(limit)}
                    OFFSET ${pgFormat.literal(offset)}
                ) as filtered_datapoints
            )
            GROUP BY datapoints.id
        `;
    }

    static async upsert(organizationId, requestIds) {
        const {rows} = await postgresClient.query(
            // Using a DO UPDATE so RETURNING returns the rows.
            `INSERT INTO datapoints (organization_id, request_id) VALUES ${requestIds.map((_, i) => `($1, $${i + 2})`).join(',')} ON CONFLICT ON CONSTRAINT datapoints_organization_id_request_id_unique DO UPDATE SET request_id = EXCLUDED.request_id RETURNING *`,
            [organizationId, ...requestIds]
        );

        return rows;
    }

    static async deleteById(organizationId, id) {
        const {rows} = await postgresClient.query(
            'DELETE FROM datapoints WHERE id = $1 AND organization_id = $2 RETURNING *',
            [id, organizationId]
        );

        return rows[0];
    }

    static async deleteByFilters(organizationId, filters) {
        const {rows} = await postgresClient.query(
            `DELETE FROM datapoints WHERE organization_id = $1 AND id IN (${this._getSafeSelectQuery({organizationId, filters, selectColumns: ['datapoints.id']})}) RETURNING *`,
            [organizationId]
        );

        return rows;
    }
}

export default SelectableModel;
