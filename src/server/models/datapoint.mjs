import pgFormat from 'pg-format';

import {postgresClient} from './index.mjs';

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
        const normalizedSelect = select.map((column) => {
            if (column.indexOf('.') === -1) {
                return `datapoints.${column}`;
            } else {
                return column;
            }
        });
        const normalizedFilters = filters.concat({
            'left': 'datapoints.organization_id',
            'op': '=',
            'right': organizationId
        }).map((filter) => {
            if (filter['left'].indexOf('.') === -1) {
                filter['left'] = `datapoints.${filter['left']}`;
            }

            return filter;
        });
        const safeSelects = normalizedSelect.map((column) => {
            const columnSegments = column.split('.');

            if (columnSegments[0] === 'datapoints') {

                return pgFormat(Array(columnSegments.length).fill('%I').join('.'), ...columnSegments);
            } else {

                return `
                        ARRAY_AGG(
                            DISTINCT
                            JSONB_BUILD_OBJECT('${columnSegments.slice(1).join('.')}', ${column})
                        ) AS ${columnSegments[0]}
                    `;
            }
        });
        const joinedTables = Array.from(new Set([
            ...normalizedSelect.map((column) => column.split('.')[0]),
            ...normalizedFilters.map((filter) => filter['left'].split('.')[0])
        ].filter((tableName) => tableName !== 'datapoints')));
        const safeJoins = pgFormat(Array(joinedTables.length).fill('INNER JOIN %I ON datapoints.id = %I.datapoint').join(' '), ...joinedTables.map((t) => [t, t]).flat());
        const safeWhere = pgFormat(normalizedFilters.map((filter) => {
            const leftSegments = filter['left'].split('.');
            const rightSegments = filter['right'].split('.');
            const safeLeft = pgFormat(Array(leftSegments.length).fill('%I').join('.'), ...leftSegments);
            const safeRight = pgFormat(Array(rightSegments.length).fill('%L').join('.'), ...rightSegments);
            const safeOps = new Set(['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'SIMILAR TO', 'NOT SIMILAR TO', 'IS', 'IS NOT', 'IN', 'NOT IN', 'ANY', 'ALL', 'BETWEEN', 'NOT BETWEEN', 'IS DISTINCT FROM', 'IS NOT DISTINCT FROM']);

            if (safeOps.has(filter['op'].toUpperCase())) {
                return `${safeLeft} ${filter['op']} ${safeRight}`;
            } else {
                throw new Error(`Invalid operator: ${filter['op']}`);
            }
        }).join(' AND '));
        const safeOrderBy = pgFormat(Array(orderBy.split('.').length).fill('%I').join('.'), ...orderBy.split('.'));
        const {rows} = await postgresClient.query(`
            SELECT ${safeSelects.join(', ')}
            FROM datapoints
            ${safeJoins}
            WHERE ${safeWhere}
            GROUP BY datapoints.id
            ORDER BY ${safeOrderBy}
            ${desc ? 'DESC' : 'ASC'}
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
