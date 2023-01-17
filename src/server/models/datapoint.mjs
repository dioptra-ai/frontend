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
            'SELECT * FROM datapoints WHERE uuid = $1 AND organization_id = $2',
            [id, organizationId]
        );

        return rows[0];
    }

    static async upsertByEventUuids(organizationId, eventUuids) {
        const {rows: events} = await postgresClient.query(
            `SELECT DISTINCT request_id FROM events WHERE organization_id = $1 AND uuid IN (${eventUuids.map((_, i) => `$${i + 2}`).join(',')})`,
            [organizationId, ...eventUuids]
        );
        const rows = Datapoint.upsertMany(organizationId, events.map((event) => event['request_id']));

        return rows;
    }

    static async upsertOne(organizationId, requestId) {
        const {rows} = await postgresClient.query(
            // Use a DO UPDATE so RETURNING returns the rows.
            'INSERT INTO datapoints (organization_id, request_id) VALUES ($1, $2) ON CONFLICT (organization_id, request_id) DO UPDATE SET request_id = $2 RETURNING *',
            [organizationId, requestId]
        );

        return rows[0];
    }

    static async upsertMany(organizationId, requestIds) {
        const {rows} = await postgresClient.query(
            // Use a DO UPDATE so RETURNING returns the rows.
            `INSERT INTO datapoints (organization_id, request_id) VALUES ${requestIds.map((_, i) => `($1, $${i + 2})`).join(',')} ON CONFLICT (organization_id, request_id) DO UPDATE SET request_id = EXCLUDED.request_id RETURNING *`,
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
                `SELECT "image_metadata", "video_metadata", "text_metadata", "request_id", "uuid", "tags"
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
