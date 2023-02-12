import assert from 'assert';
import pgFormat from 'pg-format';

import {postgresClient} from './index.mjs';

const SAFE_OPS = new Set(['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'SIMILAR TO', 'NOT SIMILAR TO', 'IS', 'IS NOT', 'IN', 'NOT IN', 'ANY', 'ALL', 'BETWEEN', 'NOT BETWEEN', 'IS DISTINCT FROM', 'IS NOT DISTINCT FROM']);

export const getCanonicalColumn = (column) => column.indexOf('.') === -1 ? `datapoints.${column}` : column;
export const getColumnTable = (column) => {
    const canonicalColumn = getCanonicalColumn(column);

    return canonicalColumn.split('.')[0];
};
export const getSafeColumn = (column) => {
    const canonicalColumn = getCanonicalColumn(column);
    const [columnTable, ...columnPath] = canonicalColumn.split('.');

    if (columnPath.length === 1) {

        return pgFormat('%I.%I', columnTable, columnPath[0]);
    } else {
        // Support for JSONB columns: datapoints.metadata.uri
        return pgFormat(`%I.%I->>${pgFormat.literal(columnPath.slice(1).join('->>'))}`, columnTable, columnPath[0]);
    }
};
export const getSafeFilter = (filter) => {
    const {left, op, right} = filter;

    assert(SAFE_OPS.has(op.toUpperCase()), 'Invalid filter op');

    const safeLeft = getSafeColumn(left);
    const safeOp = op.toUpperCase();

    let safeRight = '';

    if (Array.isArray(right)) {

        if (right.length === 0) {

            return 'FALSE';
        } else {
            safeRight = pgFormat('(%L)', right);
        }
    } else {
        safeRight = pgFormat.literal(right);
    }

    return `${safeLeft} ${safeOp} ${safeRight}`;
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
        });
        const safeFilters = canonicalFilters.map(getSafeFilter);
        const safeJoins = Array.from(new Set(
            canonicalFilters.map((filter) => getColumnTable(filter['left'])).filter((t) => t !== 'datapoints')
        )).map((tableName) => pgFormat('INNER JOIN %I ON datapoints.id = %I.datapoint', tableName, tableName));

        const {rows} = await postgresClient.query(
            pgFormat(`SELECT COUNT(*) FROM datapoints ${safeJoins.join(' ')} WHERE ${safeFilters.join(' AND ')}`)
        );

        return Number(rows[0]['count']);
    }

    static async select({
        organizationId, selectColumns = [], filters = [],
        orderBy = 'datapoints.created_at', desc = false, limit = 1000000, offset = 0
    }) {
        assert(organizationId, 'organizationId is required');

        const canonicalFilters = filters.concat({
            'left': 'organization_id',
            'op': '=',
            'right': organizationId
        });
        const selectsPerTable = selectColumns.reduce((acc, column) => {
            const tableName = getColumnTable(column);

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
        const safeJoins = Array.from(new Set([
            ...selectColumns.map(getColumnTable),
            ...canonicalFilters.map((filter) => getColumnTable(filter['left']))
        ]
            .filter((t) => t !== 'datapoints')))
            .map((tableName) => pgFormat('LEFT JOIN %I ON datapoints.id = %I.datapoint', tableName, tableName));
        const safeWhere = canonicalFilters.map(getSafeFilter);
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
