import {postgresClient} from './index.mjs';

class DatasetVersion {
    static async findAll(organizationId) {
        const {rows} = await postgresClient.query(
            'SELECT * FROM dataset_versions WHERE organization_id = $1 and is_current = true',
            [organizationId]
        );

        return rows;
    }

    static async getAllFromSameRootParent(organizationId, datasetVersionId) {
        const datasetVersion = await DatasetVersion.findById(organizationId, datasetVersionId);
        const {rows} = await postgresClient.query(
            'SELECT * FROM dataset_versions WHERE organization_id = $1 and (root_parent_uuid = $2 or uuid = $2) ORDER BY created_at ASC',
            [organizationId, datasetVersion['root_parent_uuid'] || datasetVersionId]
        );

        return rows;
    }

    static async setCurrentFromSameParent(organizationId, currentDatasetVersionId, datasetVersionId) {
        const currentDatasetVersion = await DatasetVersion.findById(organizationId, currentDatasetVersionId);
        const transactionClient = await postgresClient.connect();

        try {
            await transactionClient.query('BEGIN');

            // Mark all versions as not current.
            await transactionClient.query(
                'UPDATE dataset_versions SET is_current = false WHERE organization_id = $1 and (root_parent_uuid = $2 or uuid = $2)',
                [organizationId, currentDatasetVersion['root_parent_uuid'] || currentDatasetVersionId]
            );

            // Mark new version as current.
            await transactionClient.query(
                'UPDATE dataset_versions SET is_current = true WHERE organization_id = $1 and uuid = $2',
                [organizationId, datasetVersionId]
            );

            await transactionClient.query('COMMIT');

            return await DatasetVersion.findById(organizationId, datasetVersionId);
        } catch (e) {
            await transactionClient.query('ROLLBACK');
            throw e;
        } finally {
            transactionClient.release();
        }
    }

    static async findById(organizationId, id) {
        const {rows} = await postgresClient.query('SELECT * FROM dataset_versions WHERE uuid = $1 AND organization_id = $2', [
            id,
            organizationId
        ]);

        return rows[0];
    }

    static async createNew(organizationId, displayName, createdBy, parentUuid) {
        if (parentUuid) {
            const parent = await DatasetVersion.findById(organizationId, parentUuid);
            const transactionClient = await postgresClient.connect();

            try {
                await transactionClient.query('BEGIN');

                // Mark parent as not current.
                await transactionClient.query(
                    'UPDATE dataset_versions SET is_current = false WHERE uuid = $1 AND organization_id = $2',
                    [parentUuid, organizationId]
                );

                const {rows: [newDataset]} = await transactionClient.query(
                    'INSERT INTO dataset_versions (organization_id, display_name, created_by, is_current, root_parent_uuid) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [organizationId, displayName || parent.display_name, createdBy, true, parent.root_parent_uuid || parentUuid]
                );

                // Copy datapoints from parent.
                await transactionClient.query(
                    `INSERT INTO dataset_to_datapoints (organization_id, dataset_version, datapoint)
                    SELECT $1, $2, datapoint FROM dataset_to_datapoints WHERE dataset_version = $3`,
                    [organizationId, newDataset.uuid, parentUuid]
                );

                await transactionClient.query('COMMIT');

                return newDataset;
            } catch (e) {
                await transactionClient.query('ROLLBACK');
                throw e;
            } finally {
                transactionClient.release();
            }
        } else {
            const {rows} = await postgresClient.query(
                'INSERT INTO dataset_versions (organization_id, display_name, created_by) VALUES ($1, $2, $3) RETURNING *',
                [organizationId, displayName, createdBy]
            );

            return rows[0];
        }
    }

    static async updateById(organizationId, id, displayName) {
        const {rows} = await postgresClient.query(
            'UPDATE dataset_versions SET display_name = $1 WHERE uuid = $2 AND organization_id = $3 RETURNING *',
            [displayName, id, organizationId]
        );

        return rows[0];
    }

    static async deleteById(organizationId, id) {
        const {rows} = await postgresClient.query(
            'DELETE FROM dataset_versions WHERE uuid = $1 AND organization_id = $2 RETURNING *',
            [id, organizationId]
        );

        return rows[0];
    }


    static async addDatapointsById(organizationId, id, datapointIds) {
        const {rows} = await postgresClient.query(
            `INSERT INTO dataset_to_datapoints (organization_id, dataset_version, datapoint) VALUES ${datapointIds.map((dId, i) => `($1, $2, $${i + 3})`).join(',')} ON CONFLICT DO NOTHING RETURNING *`,
            [organizationId, id, ...datapointIds]
        );

        return rows;
    }

    static async removeDatapointsById(organizationId, id, datapointIds) {
        const {rows} = await postgresClient.query(
            'DELETE FROM dataset_to_datapoints WHERE organization_id = $1 AND dataset_version = $2 AND datapoint = ANY($3) RETURNING *',
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
            WHERE dataset_to_datapoints.organization_id = $1 AND dataset_to_datapoints.dataset_version = $2
            `,
        [organizationId, id]);

        return rows;
    }

    static async countDatapointsById(organizationId, id) {
        const {rows} = await postgresClient.query(`
            SELECT COUNT(*) 
                FROM dataset_to_datapoints 
                WHERE organization_id = $1 AND dataset_version = $2
            `,
        [organizationId, id]);

        return rows[0].count;
    }
}

export default DatasetVersion;
