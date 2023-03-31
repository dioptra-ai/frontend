import assert from 'assert';
import pgFormat from 'pg-format';
import {postgresClient} from './index.mjs';

const SAFE_OPS = new Set(['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'SIMILAR TO', 'NOT SIMILAR TO', 'IS', 'IS NOT', 'IS NULL', 'IS NOT NULL', 'IN', 'NOT IN', 'ANY', 'ALL', 'BETWEEN', 'NOT BETWEEN', 'IS DISTINCT FROM', 'IS NOT DISTINCT FROM']);
const isSafeOp = (op) => SAFE_OPS.has(op.toUpperCase());
const SAFE_IDENTIFIERS = new Set(['*']);
const SAFE_GLOBAL_IDENTIFIERS = new Set(['RANDOM()']);
const isSafeIdentifier = (identifier) => SAFE_IDENTIFIERS.has(identifier.toUpperCase());
const isSafeGlobalIdentifier = (identifier) => SAFE_GLOBAL_IDENTIFIERS.has(identifier.toUpperCase());
const JSONB_ROOT_COLUMNS = new Set(['metadata', 'metrics']);

class SelectableModel {
    static getTableName() {
        throw new Error('SelectableModel is an abstract class');
    }

    static getForeignKeyName() {
        // By convention, le foreign key name is the singular of the table name.
        // Example: datapoints -> datapoint
        return this.getTableName().replace(/s$/, '');
    }

    static isJSONBRootColumn(column) {
        return JSONB_ROOT_COLUMNS.has(column);
    }

    static getCanonicalColumn(column) {
        if (isSafeGlobalIdentifier(column)) {
            return column;
        }

        const paths = column.split('.');

        switch (paths[0]) {
        case 'tags':
        case 'predictions':
        case 'groundtruths':
        case 'datapoints':
        case 'feature_vectors':
            return column;
        default:
            return `${this.getTableName()}.${column}`;
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
        const path = this.getCanonicalColumn(column).split('.');
        const isChildOfJSONB = (i) => {
            if (i === 0) {
                return false;
            } else {
                return this.isJSONBRootColumn(path[i - 1]) || isChildOfJSONB(i - 1);
            }
        };

        return pgFormat(
            path.map((c, i) => {

                if (isSafeIdentifier(c) || isSafeGlobalIdentifier(c)) {
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
        const primaryTable = this.getTableName();
        const foreignKeyName = this.getForeignKeyName();

        return `${primaryTable} ${Array.from(new Set(canonicalColumnTables))
            .filter((table) => table !== primaryTable)
            .map((table) => {
                const [tableName, tableAlias] = table.toLowerCase().split(' as ');

                if (tableAlias) {

                    return pgFormat(`LEFT JOIN %I AS %I ON ${primaryTable}.id = %I.${foreignKeyName}`, tableName, tableAlias, tableAlias);
                } else {

                    return pgFormat(`LEFT JOIN %I ON ${primaryTable}.id = %I.${foreignKeyName}`, table, table);
                }
            })
            .join(' ')}`;
    }

    static async findAll(organizationId) {
        const {rows} = await postgresClient.query(
            `SELECT * FROM ${this.getTableName()} WHERE organization_id = $1`,
            [organizationId]
        );

        return rows;
    }

    static async findById(organizationId, id) {
        const {rows} = await postgresClient.query(
            `SELECT * FROM ${this.getTableName()} WHERE id = $1 AND organization_id = $2`,
            [id, organizationId]
        );

        return rows[0];
    }

    static async count({organizationId, filters = []}) {
        const primaryTable = this.getTableName();
        const {rows} = await postgresClient.query(`
            SELECT COUNT(DISTINCT ${primaryTable}.id) as count
            FROM (
                ${this.getSafeSelectQuery({selectColumns: [`${primaryTable}.id`], organizationId, filters})}
            ) AS ${this.getTableName()}
        `);

        return Number(rows[0]['count']);
    }

    static async select(...args) {
        const {rows} = await postgresClient.query(this.getSafeSelectQuery(...args));

        return rows;
    }

    static getSafeSelectQuery({
        organizationId, selectColumns = [], filters = [],
        orderBy, desc = false, limit = 1000000, offset = 0
    }) {
        assert(organizationId, 'organizationId is required');
        const primaryTable = this.getTableName();
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

            if (tableName === primaryTable) {
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
        const safeOrderBy = orderBy ? `ORDER BY ${this.getSafeColumn(orderBy) + (desc ? ' DESC' : ' ASC')}` : '';
        const tablesToJoinForFiltering = aliasedTables.concat(orderBy && !isSafeGlobalIdentifier(orderBy) ? [this.getColumnTable(orderBy)] : []);

        return `
            SELECT ${safeSelects.join(', ')} ${orderBy ? `, ${this.getSafeColumn(orderBy)}` : ''}
            FROM ${this.getSafeJoin(canonicalSelectTables)}
            WHERE ${primaryTable}.id IN (
                SELECT id FROM (
                    SELECT DISTINCT ${primaryTable}.id ${orderBy ? `, ${this.getSafeColumn(orderBy)}` : ''}
                    FROM ${this.getSafeJoin(tablesToJoinForFiltering)}
                    WHERE ${this.getSafeWhere(aliasedFilters)}
                    GROUP BY ${primaryTable}.id
                    ${safeOrderBy}
                    LIMIT ${pgFormat.literal(limit)}
                    OFFSET ${pgFormat.literal(offset)}
                ) as filtered_datapoints
            )
            GROUP BY ${primaryTable}.id
            ${safeOrderBy}
        `;
    }

    static async selectDistinct({organizationId, filters = [], column, orderBy, desc = false, limit = 1000000, offset = 0}) {
        const primaryTable = this.getTableName();
        const {rows} = await postgresClient.query(`
            SELECT DISTINCT ${this.getSafeColumn(column)} FROM (
                ${this.getSafeSelectQuery({selectColumns: [column], organizationId, filters, orderBy, desc, limit, offset})}
            ) AS ${primaryTable}
        `);

        return rows;
    }

    static async deleteById(organizationId, id) {
        const {rows} = await postgresClient.query(
            `DELETE FROM ${this.getTableName()} WHERE id = $1 AND organization_id = $2 RETURNING *`,
            [id, organizationId]
        );

        return rows[0];
    }

    static async deleteByFilters(organizationId, filters) {
        const primaryTable = this.getTableName();
        const {rows} = await postgresClient.query(
            `DELETE FROM ${primaryTable} WHERE organization_id = $1 AND id IN (
                SELECT id FROM (${this.getSafeSelectQuery({organizationId, filters, selectColumns: [`${primaryTable}.id`]})}) as subquery
            ) RETURNING *`,
            [organizationId]
        );

        return rows;
    }
}

export default SelectableModel;
