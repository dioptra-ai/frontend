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

    static async createNew(organizationId, requestId) {
        const {rows} = await postgresClient.query(
            'INSERT INTO datapoints (organization_id, request_id) VALUES ($1, $2) RETURNING *',
            [organizationId, requestId]
        );

        return rows[0];
    }

    static async deleteById(organizationId, id) {
        const {rows} = await postgresClient.query(
            'DELETE FROM datapoints WHERE uuid = $1 AND organization_id = $2 RETURNING *',
            [id, organizationId]
        );

        return rows[0];
    }
}

export default Datapoint;
