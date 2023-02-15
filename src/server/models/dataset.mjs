import {postgresClient, postgresTransaction} from './index.mjs';

// dataset.create()                 -> creates a new clean uncommitted version empty
// dataset.commit()                 -> commit uncommitted version
//                                  -> creates a new clean uncommitted version from committed version and create version line
//                                  -> return committed version
// dataset.checkout(uuid)           -> blocks if uncommitted version is dirty, otherwise:
//                                  -> deletes uncommitted version
//                                  -> creates a new clean uncommitted version from uuid and create version line
//                                  -> return uuid or latest committed version for 'main'
// dataset.add(...)                 -> add to uncommitted version
//                                  -> sets uncommitted version as dirty
// dataset.commit()                 -> commit uncommitted version
//                                  -> creates a new clean uncommitted version from committed version and create version line
//                                  -> return committed version
// dataset.diff(initial_uuid)       -> return diff between initial_uuid and uncommitted version
// dataset.diff('uuid_1', 'uuid_2') -> return diff between uuid_1 and uuid_2

class Dataset {
    static async _createCleanUncomittedVersion(transaction, organizationId, userId, datasetUuid, parentVersionUuid) {
        // Create a new clean uncommitted version.
        const {rows: [datasetVersion]} = await transaction.query(
            'INSERT INTO dataset_versions (organization_id, created_by, dataset_uuid, dirty, committed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [organizationId, userId, datasetUuid, false, false]
        );

        if (parentVersionUuid) {
            // Copy datapoints from parent.
            await transaction.query(
                `INSERT INTO dataset_to_datapoints (dataset_version, datapoint)
                SELECT $1, datapoint FROM dataset_to_datapoints WHERE dataset_version = $2`,
                [datasetVersion.uuid, parentVersionUuid]
            );

            // Create a new version line.
            await transaction.query(
                'INSERT INTO dataset_version_lines (parent_uuid, child_uuid) VALUES ($1, $2)',
                [parentVersionUuid, datasetVersion.uuid]
            );
        }

        return datasetVersion;
    }


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

    static async findUncommittedVersion(organizationId, id) {
        const {rows: [uncommittedVersion]} = await postgresClient.query(
            'SELECT * FROM dataset_versions WHERE dataset_uuid = $1 AND organization_id = $2 AND committed = false',
            [id, organizationId]
        );

        // There must be an uncommitted version.
        if (!uncommittedVersion) {
            throw new Error('Uncommitted version not found.');
        }

        return uncommittedVersion;
    }

    static async findDatapointsByVersion(organizationId, versionId) {
        const {rows} = await postgresClient.query(
            `SELECT datapoint AS id FROM dataset_to_datapoints
                WHERE dataset_version = $1 AND organization_id = $2`,
            [versionId, organizationId]
        );

        return rows;
    }

    static async findDatapoints(organizationId, id) {
        const uncommittedVersion = await Dataset.findUncommittedVersion(organizationId, id);

        return Dataset.findDatapointsByVersion(organizationId, uncommittedVersion.uuid);
    }

    static async findVersions(organizationId, id) {
        const {rows} = await postgresClient.query(
            `SELECT * FROM dataset_versions
            WHERE dataset_versions.dataset_uuid = $1 AND dataset_versions.organization_id = $2
            ORDER BY dataset_versions.created_at DESC`,
            [id, organizationId]
        );

        if (!rows.length) {
            throw new Error('No versions found.');
        }

        return rows;
    }

    static async upsert(organizationId, {created_by, display_name, uuid}) {

        if (uuid) {
            const {rows: [dataset]} = await postgresClient.query(
                'UPDATE datasets SET display_name = $1 WHERE uuid = $2 AND organization_id = $3 RETURNING *',
                [display_name, uuid, organizationId]
            );

            return dataset;
        } else {

            return postgresTransaction(async (transactionClient) => {
                const {rows: [dataset]} = await transactionClient.query(
                    'INSERT INTO datasets (organization_id, created_by, display_name) VALUES ($1, $2, $3) RETURNING *',
                    [organizationId, created_by, display_name]
                );

                await Dataset._createCleanUncomittedVersion(transactionClient, organizationId, created_by, dataset.uuid);

                return dataset;
            });
        }
    }

    static commit(organizationId, id, message) {

        return postgresTransaction(async (transactionClient) => {
            // Commmit uncomitted version.
            const {rows: [committedVersion]} = await transactionClient.query(
                'UPDATE dataset_versions SET committed = true, dirty = false, message = $1 WHERE dataset_uuid = $2 AND organization_id = $3 AND committed = false RETURNING *',
                [message, id, organizationId]
            );

            // Create a new clean uncomitted child version.
            await Dataset._createCleanUncomittedVersion(transactionClient, organizationId, committedVersion.created_by, id, committedVersion.uuid);

            return committedVersion;
        }, 'BEGIN ISOLATION LEVEL SERIALIZABLE');
    }

    static checkout(organizationId, id, versionId) {

        return postgresTransaction(async (transactionClient) => {
            // Delete uncommitted version.
            const {rows: [deletedVersion]} = await transactionClient.query(
                'DELETE FROM dataset_versions WHERE dataset_uuid = $1 AND organization_id = $2 AND committed = false RETURNING *',
                [id, organizationId]
            );

            // Create a new clean uncomitted child version.
            await Dataset._createCleanUncomittedVersion(transactionClient, organizationId, deletedVersion.created_by, id, versionId);

            return versionId;
        }, 'BEGIN ISOLATION LEVEL SERIALIZABLE');
    }

    static add(organizationId, id, datapointIds) {

        return postgresTransaction(async (transactionClient) => {
            // Get uncommitted version.
            const {rows: [uncommittedVersion]} = await transactionClient.query(
                'SELECT * FROM dataset_versions WHERE dataset_uuid = $1 AND organization_id = $2 AND committed = false',
                [id, organizationId]
            );

            // Add datapoints to uncommitted version.
            await transactionClient.query(
                `INSERT INTO dataset_to_datapoints (dataset_version, datapoint) VALUES ${datapointIds.map((_, index) => `($1, $${index + 2})`).join(', ')} ON CONFLICT DO NOTHING`,
                [uncommittedVersion.uuid, ...datapointIds]
            );

            // Mark uncommitted version as dirty.
            await transactionClient.query(
                'UPDATE dataset_versions SET dirty = true WHERE uuid = $1',
                [uncommittedVersion.uuid]
            );
        }, 'BEGIN ISOLATION LEVEL SERIALIZABLE');
    }

    static remove(organizationId, id, datapointIds) {

        return postgresTransaction(async (transactionClient) => {
            // Get uncommitted version.
            const {rows: [uncommittedVersion]} = await transactionClient.query(
                'SELECT * FROM dataset_versions WHERE dataset_uuid = $1 AND organization_id = $2 AND committed = false',
                [id, organizationId]
            );

            // Remove datapoints from uncommitted version.
            await Promise.all(
                Array(Math.ceil(datapointIds.length / Dataset.POSTGRES_MAX_PARAMS)).fill().map(async (_, index) => {
                    const offset = index * Dataset.POSTGRES_MAX_PARAMS;
                    const datapointIdsSlice = datapointIds.slice(offset, offset + Dataset.POSTGRES_MAX_PARAMS);

                    await transactionClient.query(
                        `DELETE FROM dataset_to_datapoints WHERE dataset_version = $1 AND datapoint IN (${datapointIdsSlice.map((datapointId, index) => `$${index + 2}`).join(', ')})`,
                        [uncommittedVersion.uuid, ...datapointIdsSlice]
                    );
                })
            );
            // Mark uncommitted version as dirty.
            await transactionClient.query(
                'UPDATE dataset_versions SET dirty = true WHERE uuid = $1',
                [uncommittedVersion.uuid]
            );
        }, 'BEGIN ISOLATION LEVEL SERIALIZABLE');
    }

    static delete(organizationId, id) {

        return postgresClient.query(
            'DELETE FROM datasets WHERE uuid = $1 AND organization_id = $2',
            [id, organizationId]
        );
    }

    static async getDiff(organizationId, firstVersionId, secondVersionId) {
        const [
            {rows: [firstVersion]}, {rows: [secondVersion]},
            {rows: firstVersionDatapoints}, {rows: secondVersionDatapoints}
        ] = await Promise.all([
            postgresClient.query(
                'SELECT * FROM dataset_versions WHERE uuid = $1 AND organization_id = $2',
                [firstVersionId, organizationId]
            ),
            postgresClient.query(
                'SELECT * FROM dataset_versions WHERE uuid = $1 AND organization_id = $2',
                [secondVersionId, organizationId]
            ),
            postgresClient.query(
                'SELECT datapoint FROM dataset_to_datapoints WHERE dataset_version = $1',
                [firstVersionId]
            ),
            postgresClient.query(
                'SELECT datapoint FROM dataset_to_datapoints WHERE dataset_version = $1',
                [secondVersionId]
            )
        ]);
        const [{rows: [firstVersionDataset]}, {rows: [secondVersionDataset]}] = await Promise.all([
            postgresClient.query(
                'SELECT * FROM datasets WHERE uuid = $1',
                [firstVersion.dataset_uuid]
            ),
            postgresClient.query(
                'SELECT * FROM datasets WHERE uuid = $1',
                [secondVersion.dataset_uuid]
            )
        ]);

        const firstVersionDatapointIds = firstVersionDatapoints.map((datapoint) => datapoint.datapoint);
        const firstVersionDatapointIdsSet = new Set(firstVersionDatapointIds);
        const secondVersionDatapointIds = secondVersionDatapoints.map((datapoint) => datapoint.datapoint);
        const secondVersionDatapointIdsSet = new Set(secondVersionDatapointIds);

        const added = secondVersionDatapointIds.filter((datapointId) => !firstVersionDatapointIdsSet.has(datapointId));
        const removed = firstVersionDatapointIds.filter((datapointId) => !secondVersionDatapointIdsSet.has(datapointId));

        return {
            added,
            removed,
            version1: firstVersion,
            version2: secondVersion,
            dataset1: firstVersionDataset,
            dataset2: secondVersionDataset
        };
    }

    static async getVersionById(organizationId, versionId) {
        const {rows: [version]} = await postgresClient.query(
            'SELECT * FROM dataset_versions WHERE uuid = $1 AND organization_id = $2',
            [versionId, organizationId]
        );

        return version;
    }
}

export default Dataset;
