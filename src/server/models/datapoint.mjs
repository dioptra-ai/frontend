import assert from 'assert';
import pgFormat from 'pg-format';

import {postgresClient} from './index.mjs';

const SAFE_OPS = new Set(['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'SIMILAR TO', 'NOT SIMILAR TO', 'IS', 'IS NOT', 'IN', 'NOT IN', 'ANY', 'ALL', 'BETWEEN', 'NOT BETWEEN', 'IS DISTINCT FROM', 'IS NOT DISTINCT FROM']);

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

    static async select(organizationId, select, filters, orderBy = 'datapoints.created_at', desc = false, limit = 1000000, offset = 0) {
        assert(filters.every((f) => SAFE_OPS.has(f['op'].toUpperCase())), 'Invalid filter op');

        const getCanonicalColumn = (column) => column.indexOf('.') === -1 ? `datapoints.${column}` : column;
        const getCanonicalColumnTable = (column) => column.split('.')[0];
        const getSafeColumn = (column) => pgFormat(column.split('.').map(() => '%I').join('.'), ...column.split('.'));

        const canonicalFilters = filters.concat({
            'left': 'organization_id',
            'op': '=',
            'right': organizationId
        }).map((filter) => ({
            'left': getCanonicalColumn(filter['left']),
            'op': filter['op'],
            'right': filter['right']
        }));
        const canonicalSelect = select.map(getCanonicalColumn);
        const selectsPerTable = canonicalSelect.reduce((acc, column) => {
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
                acc.push(
                    pgFormat(`ARRAY_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            ${columns.map((column) => [pgFormat.literal(column.split('.').slice(1)), getSafeColumn(column)]).flat().join(', ')}
                        )
                    ) AS %I`, tableName)
                );
            }

            return acc;
        }, []);
        const safeJoins = Array.from(new Set([
            ...canonicalSelect.map(getCanonicalColumnTable),
            ...canonicalFilters.map((filter) => getCanonicalColumnTable(filter['left']))
        ]
            .filter((t) => t !== 'datapoints')))
            .map((tableName) => pgFormat('INNER JOIN %I ON datapoints.id = %I.datapoint', tableName, tableName));
        const safeWhere = canonicalFilters.map((filter) => [
            getSafeColumn(filter['left']), filter['op'], pgFormat.literal(filter['right'])
        ].join(' '));
        const {rows} = await postgresClient.query(`
            SELECT ${safeSelects.join(', ')}
            FROM datapoints
            ${safeJoins.join(' ')}
            WHERE ${safeWhere.join(' AND ')}
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
            'DELETE FROM datapoints WHERE uuid = $1 AND organization_id = $2 RETURNING *',
            [id, organizationId]
        );

        return rows[0];
    }


    static async _legacyFindDatapointEventsByDatapointIds(organizationId, datapointIds) {
        if (datapointIds.length === 0) {
            return [];
        } else {
            const {rows} = await postgresClient.query(
                `SELECT "image_metadata", "video_metadata", "text_metadata", "request_id", "tags"
            FROM events
            WHERE organization_id = $1 AND 
                prediction IS NULL AND
                groundtruth IS NULL AND
                request_id IN (SELECT request_id FROM datapoints WHERE uuid IN (${datapointIds.map((_, i) => `$${i + 2}`).join(',')}))`,
                [organizationId, ...datapointIds]
            );

            return rows;
        }
    }

    static async _legacyFindGroundtruthAndPredictionEventsByDatapointIds(organizationId, datapointIds) {
        if (datapointIds.length === 0) {
            return [];
        } else {
            const {rows} = await postgresClient.query(
                `SELECT "groundtruth", "prediction", "uuid"
            FROM events
            WHERE organization_id = $1 AND
                (prediction IS NOT NULL OR groundtruth IS NOT NULL) AND
                request_id IN (SELECT request_id FROM datapoints WHERE uuid IN (${datapointIds.map((_, i) => `$${i + 2}`).join(',')}))`,
                [organizationId, ...datapointIds]
            );

            return rows;
        }
    }
}

export default Datapoint;
