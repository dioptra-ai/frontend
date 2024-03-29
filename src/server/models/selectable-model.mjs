import assert from 'assert';
import pgFormat from 'pg-format';
import {postgresClient} from './index.mjs';

const SAFE_OPS = new Set(['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'SIMILAR TO', 'NOT SIMILAR TO', 'IS', 'IS NOT', 'IS NULL', 'IS NOT NULL', 'IN', 'NOT IN', 'ANY', 'ALL', 'BETWEEN', 'NOT BETWEEN', 'IS DISTINCT FROM', 'IS NOT DISTINCT FROM']);
const isSafeOp = (op) => SAFE_OPS.has(op.toUpperCase());
const SAFE_IDENTIFIERS = new Set(['*']);
const SAFE_GLOBAL_IDENTIFIERS = new Set(['RANDOM()']);
const isSafeIdentifier = (identifier) => SAFE_IDENTIFIERS.has(identifier.toUpperCase());
const isSafeGlobalIdentifier = (identifier) => SAFE_GLOBAL_IDENTIFIERS.has(identifier.toUpperCase());
// TODO: remove classifications from this list once we have a classifications table
const JSONB_ROOT_COLUMNS = new Set(['metadata', 'metrics', 'classifications']);
const ALL_TABLE_NAMES = new Set(['datapoints', 'predictions', 'groundtruths', 'feature_vectors', 'tags', 'bboxes', 'lanes', 'completions']);

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

    static getSafeFilters(filters) {

        return filters.map((filter) => {
            assert(filter, `${filter} is not a valid filter`);
            assert(isSafeOp(filter['op']), `Unsafe op: "${filter['op']}"`);

            return {
                'left': this.getSafeColumn(filter['left']),
                'op': filter['op'],
                'right': Array.isArray(filter['right']) ? filter['right'].map(pgFormat.literal) : pgFormat.literal(filter['right'])
            };
        });
    }

    static getColumnTable(column) {

        return this.getSafeColumn(column).split('.')[0];
    }

    static getColumnName(column) {

        return this.getSafeColumn(column).split('.').slice(1).join('.');
    }

    static getSafeColumn(column) {
        if (isSafeGlobalIdentifier(column)) {

            return column;
        }

        const paths = column.split('.');
        const canonicalColumn = ALL_TABLE_NAMES.has(paths[0]) ? column : `${this.getTableName()}.${column}`;
        const canonicalPath = canonicalColumn.split('.');
        const isChildOfJSONB = (i) => {
            if (i === 0) {
                return false;
            } else {
                return this.isJSONBRootColumn(canonicalPath[i - 1]) || isChildOfJSONB(i - 1);
            }
        };

        return pgFormat(
            canonicalPath.map((c, i) => {

                if (isSafeIdentifier(c) || isSafeGlobalIdentifier(c)) {
                    return i === 0 ? '%s' : '.%s';
                } else if (isChildOfJSONB(i)) {
                    return '->%L';
                } else {
                    return i === 0 ? '%I' : '.%I';
                }
            }).join(''),
            ...canonicalPath.map((c) => c.replaceAll(/['"]/g, ''))
        );
    }

    static getAliasedColumnForJSONB(safeColumn) {
        const paths = safeColumn.split(/(->>|->)/);

        if (paths.length > 1) {
            const name = paths[paths.length - 1].replaceAll(/['"]/g, '');

            return `${safeColumn} AS ${pgFormat.ident(name)}`;
        } else {
            return safeColumn;
        }
    }

    static getSafeWhere(safeFilters) {

        return safeFilters.map((safeFilter) => {
            const op = safeFilter['op'].toUpperCase();

            switch (op) {
            case 'IN':
            case 'NOT IN':
                assert(Array.isArray(safeFilter['right']), `Right side of "${op}" must be an array`);

                if (safeFilter['right'].length === 0) {
                    return op === 'IN' ? 'FALSE' : 'TRUE';
                } else {
                    return `${safeFilter['left']} ${op} (${safeFilter['right']})`;
                }
            default:
                return `${safeFilter['left']} ${op} ${safeFilter['right']}`;
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
        orderBy, desc = false, limit, offset = 0
    }) {
        assert(organizationId, 'organizationId is required');
        const primaryTable = this.getTableName();
        const safeSelectColumns = selectColumns.map(this.getSafeColumn.bind(this));
        const canonicalFilters = this.getSafeFilters(filters.concat({
            'left': 'organization_id',
            'op': '=',
            'right': organizationId
        }));
        const canonicalSelectColumnsPerTable = safeSelectColumns.reduce((acc, column) => {
            const tableName = this.getColumnTable(column);

            if (!acc[tableName]) {
                acc[tableName] = [];
            }

            acc[tableName].push(column);

            return acc;
        }, {});
        const safeSelects = Object.entries(canonicalSelectColumnsPerTable).reduce((acc, [tableName, columns]) => {

            if (tableName === primaryTable) {
                acc.push(...columns.map((c) => this.getAliasedColumnForJSONB(c)));
            } else if (columns.length === 1 && this.getColumnName(columns[0]) === '*') {
                acc.push(pgFormat('ARRAY_AGG(to_jsonb(%I)) AS %I', tableName, tableName));
            } else {
                // Aggregate distinct JSONB objects with column values of tableName.
                // Example: JSONB_BUILD_OBJECT('class_name', predictions.class_name, 'confidence', predictions.confidence, ...)
                // Then with ARRAY_REMOVE, remove objects that have only null values.
                // Example: ARRAY_REMOVE(..., '{"class_name": null, "confidence": null, ...}')
                // This would happen if for example there are no predictions for a datapoint so the LEFT JOIN joins predictions.* with all null values.
                acc.push(
                    pgFormat(`
                        ARRAY_REMOVE(
                            ARRAY_AGG( 
                                ${''/* ex: JSONB_BUILD_OBJECT('class_name', predictions.class_name, 'confidence', predictions.confidence, ...)*/}
                                JSONB_BUILD_OBJECT(
                                    ${columns.map((c) => [`'${this.getColumnName(c).replaceAll(/['"]/gm, '')}'`, c]).flat().join(', ')}
                                )
                            ), 
                            ${''/* ex: {"class_name": null, "confidence": null, ...} */}
                            '{${columns.map((c) => this.getColumnName(c).replaceAll(/['"]/gm, '')).map((cc) => `"${cc}": null`)}}'
                        ) AS %I`, tableName)
                );
            }

            return acc;
        }, []);
        const canonicalSelectTables = safeSelectColumns.map(this.getColumnTable.bind(this));
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

                    if (tableName === primaryTable) {
                        acc.push(filter);
                    } else {
                        const columnName = filter['left'].split('.')[1];

                        acc.push({
                            'left': `${tableName}_${i}.${columnName}`,
                            'op': filter['op'],
                            'right': filter['right']
                        });
                    }
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

                    if (tableName === primaryTable) {
                        acc.push(tableName);
                    } else {
                        acc.push(`${tableName} AS ${tableName}_${i}`);
                    }
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

    static async deleteByFilters({organizationId, filters, orderBy, desc, limit, offset}) {
        const primaryTable = this.getTableName();
        const {rows} = await postgresClient.query(
            `DELETE FROM ${primaryTable} WHERE organization_id = $1 AND id IN (
                SELECT id FROM (${
    this.getSafeSelectQuery({
        organizationId, filters, orderBy, desc, limit, offset, selectColumns: [`${primaryTable}.id`]
    })
}) as subquery
            ) RETURNING *`,
            [organizationId]
        );

        return rows;
    }
}

export default SelectableModel;
