import assert from 'assert';
import pgFormat from 'pg-format';

import {postgresClient} from './index.mjs';

const SAFE_OPS = new Set(['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'SIMILAR TO', 'NOT SIMILAR TO', 'IS', 'IS NOT', 'IS NULL', 'IS NOT NULL', 'IN', 'NOT IN', 'ANY', 'ALL', 'BETWEEN', 'NOT BETWEEN', 'IS DISTINCT FROM', 'IS NOT DISTINCT FROM']);
const isSafeOp = (op) => SAFE_OPS.has(op.toUpperCase());
const SAFE_IDENTIFIERS = new Set(['*', 'RANDOM()']);
const isSafeIdentifier = (identifier) => SAFE_IDENTIFIERS.has(identifier.toUpperCase());

const getCanonicalColumn = (column) => column.indexOf('.') === -1 ? `datapoints.${column}` : column;
const getCanonicalFilters = (filters) => filters.map((filter) => ({
    'left': getCanonicalColumn(filter['left']),
    'op': filter['op'],
    'right': filter['right']
}));

export const getCanonicalColumnTable = (column) => column.split('.')[0];
export const getSafeColumn = (column) => {

    return pgFormat(column.split('.').map((c) => isSafeIdentifier(c) ? '%s' : '%I').join('.'), ...column.split('.'));
};
const getSafeWhere = (canonicalFilters) => {

    return canonicalFilters.map((filter) => {
        assert(isSafeOp(filter['op']), `Unsafe op: ${filter['op']}`);

        switch (filter['op'].toUpperCase()) {
        case 'IN':
        case 'NOT IN':
            if (filter['right'].length === 0) {
                return 'FALSE';
            } else {
                return `${getSafeColumn(filter['left'])} ${filter['op']} (${pgFormat.literal(filter['right'])})`;
            }
        default:
            return `${getSafeColumn(filter['left'])} ${filter['op']} ${pgFormat.literal(filter['right'])}`;
        }
    }).join(' AND ');
};
const getSafeFrom = (canonicalColumnTables) => {

    return `FROM datapoints ${Array.from(new Set(canonicalColumnTables))
        .filter((table) => table !== 'datapoints')
        .map((table) => pgFormat('INNER JOIN %I ON datapoints.id = %I.datapoint', table, table))
        .join(' ')}`;
};

class Datapoint {
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
        assert(organizationId, 'organizationId is required');

        const canonicalFilters = getCanonicalFilters(filters.concat({
            'left': 'organization_id',
            'op': '=',
            'right': organizationId
        }));
        const canonicalFilterTables = canonicalFilters.map((filter) => getCanonicalColumnTable(filter['left']));

        const {rows} = await postgresClient.query(
            pgFormat(`SELECT COUNT(DISTINCT datapoints.id) as count ${getSafeFrom(canonicalFilterTables)} WHERE ${getSafeWhere(canonicalFilters)}`)
        );

        return Number(rows[0]['count']);
    }

    static async select({
        organizationId, selectColumns = [], filters = [],
        orderBy = 'datapoints.created_at', desc = false, limit = 1000000, offset = 0
    }) {
        assert(organizationId, 'organizationId is required');
        const canonicalSelectColumns = selectColumns.map(getCanonicalColumn);
        const canonicalFilters = getCanonicalFilters(filters.concat({
            'left': 'organization_id',
            'op': '=',
            'right': organizationId
        }));
        const canonicalSelectColumnsPerTable = canonicalSelectColumns.reduce((acc, column) => {
            const tableName = getCanonicalColumnTable(column);

            if (!acc[tableName]) {
                acc[tableName] = [];
            }

            acc[tableName].push(column);

            return acc;
        }, {});
        const safeSelects = Object.entries(canonicalSelectColumnsPerTable).reduce((acc, [tableName, columns]) => {
            if (tableName === 'datapoints') {
                acc.push(...columns.map(getSafeColumn));
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
                                JSONB_BUILD_OBJECT(
                                    ${columns.map((column) => [pgFormat.literal(column.split('.').slice(1)), getSafeColumn(column)]).flat().join(', ')}
                                )
                            ), '{${columns.map((c) => pgFormat.literal(c.split('.').slice(1).join('.')).replaceAll('\'', '')).map((cc) => `"${cc}": null`)}}'
                        ) AS %I`, tableName)
                );
            }

            return acc;
        }, []);
        const canonicalSelectTables = canonicalSelectColumns.map(getCanonicalColumnTable);
        const canonicalFilterTables = canonicalFilters.map((filter) => getCanonicalColumnTable(filter['left']));

        const {rows} = await postgresClient.query(`
            SELECT ${safeSelects.join(', ')}
            ${getSafeFrom(canonicalSelectTables)}
            WHERE datapoints.id IN (
                SELECT id FROM (
                    SELECT DISTINCT datapoints.id, ${getSafeColumn(orderBy)}
                    ${getSafeFrom(canonicalFilterTables)}
                    WHERE ${getSafeWhere(canonicalFilters)}
                    GROUP BY datapoints.id
                    ORDER BY ${getSafeColumn(orderBy)} ${desc ? 'DESC' : 'ASC'}
                    LIMIT ${pgFormat.literal(limit)}
                    OFFSET ${pgFormat.literal(offset)}
                ) as filtered_datapoints
            )
            GROUP BY datapoints.id
        `);

        return rows;
    }

    static async upsertByEventUuids(organizationId, eventUuids) {
        const {rows: events} = await postgresClient.query(
            `SELECT DISTINCT request_id FROM events WHERE organization_id = $1 AND uuid IN (${eventUuids.map((_, i) => `$${i + 2}`).join(',')})`,
            [organizationId, ...eventUuids]
        );
        const rows = Datapoint.upsert(organizationId, events.map((event) => event['request_id']));

        return rows;
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
        const canonicalFilters = getCanonicalFilters(filters.concat({
            'left': 'organization_id',
            'op': '=',
            'right': organizationId
        }));
        const {rows} = await postgresClient.query(
            `DELETE FROM datapoints WHERE ${getSafeWhere(canonicalFilters)} RETURNING *`
        );

        return rows;
    }
}

export default Datapoint;
