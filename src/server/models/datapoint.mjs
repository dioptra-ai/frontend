import {postgresClient} from './index.mjs';
import SelectableModel from './selectable-model.mjs';

class Datapoint extends SelectableModel {
    static getTableName() {
        return 'datapoints';
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

    static async findVectorIds(organizationId, filters, orderBy, desc, limit, offset, type, modelName) {
        const {rows} = await postgresClient.query(
            `SELECT feature_vectors.id 
                FROM feature_vectors 
                INNER JOIN predictions ON feature_vectors.prediction = predictions.id
                WHERE predictions.datapoint IN (
                    ${this.getSafeSelectQuery({organizationId, filters, orderBy, desc, limit, offset, selectColumns: ['datapoints.id']})}
                )
                AND feature_vectors.type = $1
                AND feature_vectors.model_name = $2`,
            [type, modelName || '']
        );

        return rows.map((row) => row['id']);
    }
}

export default Datapoint;
