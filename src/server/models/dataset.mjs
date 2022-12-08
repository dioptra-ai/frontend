import {postgresClient} from './index.mjs';

class Dataset {
    static async findAll(organizationId) {
        const {rows} = await postgresClient.query(
            'SELECT * FROM datasets WHERE organization_id = $1',
            [organizationId]
        );

        return rows;
    }

    static async findById(organizationId, id) {
        const {rows} = await postgresClient.query('SELECT * FROM datasets WHERE uuid = $1 AND organization_id = $2', [
            id,
            organizationId
        ]);

        return rows[0];
    }

    static async createNew(organizationId, displayName, createdBy) {
        const {rows} = await postgresClient.query(
            'INSERT INTO datasets (organization_id, display_name, created_by) VALUES ($1, $2, $3) RETURNING *',
            [organizationId, displayName, createdBy]
        );

        return rows[0];
    }

    static async updateById(organizationId, id, displayName) {
        const {rows} = await postgresClient.query(
            'UPDATE datasets SET display_name = $1 WHERE uuid = $2 AND organization_id = $3 RETURNING *',
            [displayName, id, organizationId]
        );

        return rows[0];
    }

    static async deleteById(organizationId, id) {
        const {rows} = await postgresClient.query(
            'DELETE FROM datasets WHERE uuid = $1 AND organization_id = $2 RETURNING *',
            [id, organizationId]
        );

        return rows[0];
    }

    static async addDatapointsById(organizationId, id, datapointIds) {
        const {rows} = await postgresClient.query(
            `INSERT INTO dataset_to_datapoints (organization_id, dataset, datapoint) VALUES ${datapointIds.map((dId, i) => `($1, $2, $${i + 3})`).join(',')} ON CONFLICT DO NOTHING RETURNING *`,
            [organizationId, id, ...datapointIds]
        );

        return rows;
    }

    static async removeDatapointsById(organizationId, id, datapointIds) {
        const {rows} = await postgresClient.query(
            'DELETE FROM dataset_to_datapoints WHERE organization_id = $1 AND dataset = $2 AND datapoint = ANY($3) RETURNING *',
            [organizationId, id, datapointIds]
        );

        return rows;
    }

    static async getDatapointsById(organizationId, id) {
        const {rows} = await postgresClient.query(`
            SELECT datapoints.*
            FROM datapoints
            JOIN dataset_to_datapoints 
                ON datapoints.uuid = dataset_to_datapoints.datapoint
            WHERE dataset_to_datapoints.organization_id = $1 AND dataset_to_datapoints.dataset = $2
            `,
        [organizationId, id]);

        return rows;
    }

    static async countDatapointsById(organizationId, id) {
        const {rows} = await postgresClient.query(`
            SELECT COUNT(*) 
                FROM dataset_to_datapoints 
                WHERE organization_id = $1 AND dataset = $2
            `,
        [organizationId, id]);

        return rows[0].count;
    }
}

export default Dataset;
