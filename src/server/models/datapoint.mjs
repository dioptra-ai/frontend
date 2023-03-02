import assert from 'assert';
import pgFormat from 'pg-format';

import {postgresClient} from './index.mjs';

const SAFE_OPS = new Set(['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'SIMILAR TO', 'NOT SIMILAR TO', 'IS', 'IS NOT', 'IN', 'NOT IN', 'ANY', 'ALL', 'BETWEEN', 'NOT BETWEEN', 'IS DISTINCT FROM', 'IS NOT DISTINCT FROM']);

const getCanonicalColumn = (column) => column.indexOf('.') === -1 ? `datapoints.${column}` : column;

export const getCanonicalColumnTable = (column) => column.split('.')[0];
export const getSafeColumn = (column) => pgFormat(column.split('.').map(() => '%I').join('.'), ...column.split('.'));
const getSafeWhere = (canonicalFilters) => {

    return canonicalFilters.map((filter) => {
        assert(SAFE_OPS.has(filter['op'].toUpperCase()), `Unsafe op: ${filter['op']}`);

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

        const canonicalFilters = filters.concat({
            'left': 'organization_id',
            'op': '=',
            'right': organizationId
        }).map((filter) => ({
            'left': getCanonicalColumn(filter['left']),
            'op': filter['op'],
            'right': filter['right']
        }));
        const canonicalColumnTables = canonicalFilters.map((filter) => getCanonicalColumnTable(filter['left']));

        const {rows} = await postgresClient.query(
            pgFormat(`SELECT COUNT(*) ${getSafeFrom(canonicalColumnTables)} WHERE ${getSafeWhere(canonicalFilters)}`)
        );

        return Number(rows[0]['count']);
    }

    static async select({
        organizationId, selectColumns = [], filters = [],
        orderBy = 'datapoints.created_at', desc = false, limit = 1000000, offset = 0
    }) {
        assert(organizationId, 'organizationId is required');
        const canonicalSelect = selectColumns.map(getCanonicalColumn);
        const canonicalFilters = filters.concat({
            'left': 'organization_id',
            'op': '=',
            'right': organizationId
        });
        const selectsPerTable = selectColumns.reduce((acc, column) => {
            const tableName = getCanonicalColumnTable(column);

            if (!acc[tableName]) {
                acc[tableName] = [];
            }

            acc[tableName].push(column);

            return acc;
        }, {});
        const safeSelects = Object.entries(selectsPerTable).reduce((acc, [tableName, columns]) => {
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
        const canonicalColumnTables = [
            ...canonicalSelect.map(getCanonicalColumnTable),
            ...canonicalFilters.map((filter) => getCanonicalColumnTable(filter['left']))
        ];
        const {rows} = await postgresClient.query(`
            SELECT ${safeSelects.join(', ')}
            ${getSafeFrom(canonicalColumnTables)}
            WHERE ${getSafeWhere(canonicalFilters)}
            GROUP BY datapoints.id
            ORDER BY ${getSafeColumn(orderBy)} ${desc ? 'DESC' : 'ASC'}
            LIMIT ${pgFormat.literal(limit)}
            OFFSET ${pgFormat.literal(offset)}
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
}

export default Datapoint;
