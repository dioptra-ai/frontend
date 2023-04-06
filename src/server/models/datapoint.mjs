import pgFormat from 'pg-format';

import {postgresClient} from './index.mjs';
import SelectableModel from './selectable-model.mjs';
import Dataset from './dataset.mjs';
import {deepDropNulls} from '../common/utils.mjs';

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
                    SELECT id FROM (
                        ${this.getSafeSelectQuery({organizationId, filters, orderBy, desc, limit, offset, selectColumns: ['datapoints.id']})}
                    ) AS subquery
                )
                AND feature_vectors.type = $1
                AND feature_vectors.model_name = $2`,
            [type, modelName || '']
        );

        return rows.map((row) => row['id']);
    }

    static async getSafeSelectQueryWithDatasetId({organizationId, filters, orderBy, desc, limit, offset, selectColumns, datasetId}) {
        const version = await Dataset.findUncommittedVersion(organizationId, datasetId);
        const safeOrderBy = orderBy ? `ORDER BY ${this.getSafeColumn(orderBy) + (desc ? ' DESC' : ' ASC')}` : '';

        return `
            SELECT filtered_datapoints.* FROM (
                ${super.getSafeSelectQuery({organizationId, filters, selectColumns})}
            ) AS filtered_datapoints
            INNER JOIN dataset_to_datapoints ON filtered_datapoints.id = dataset_to_datapoints.datapoint
            WHERE dataset_to_datapoints.dataset_version = ${pgFormat.literal(version['uuid'])} AND dataset_to_datapoints.organization_id = ${pgFormat.literal(organizationId)}
            ${safeOrderBy}
            LIMIT ${pgFormat.literal(limit)}
            OFFSET ${pgFormat.literal(offset)}
        `;
    }

    static async select({organizationId, filters, orderBy, desc, limit, offset, selectColumns, datasetId}) {

        if (datasetId) {
            const safeSelectQuery = await this.getSafeSelectQueryWithDatasetId({organizationId, filters, orderBy, desc, limit, offset, selectColumns, datasetId});
            const {rows} = await postgresClient.query(safeSelectQuery);

            return deepDropNulls(rows);
        } else {
            return super.select({organizationId, filters, orderBy, desc, limit, offset, selectColumns});
        }
    }

    static async count({organizationId, filters, datasetId}) {

        if (datasetId) {
            const version = await Dataset.findUncommittedVersion(organizationId, datasetId);
            const {rows} = await postgresClient.query(
                `SELECT COUNT(*) FROM (
                ${this.getSafeSelectQuery({organizationId, filters, selectColumns: ['datapoints.id']})}
                ) AS filtered_datapoints
                INNER JOIN dataset_to_datapoints ON filtered_datapoints.id = dataset_to_datapoints.datapoint
                WHERE dataset_to_datapoints.dataset_version = $1 AND dataset_to_datapoints.organization_id = $2`,
                [version['uuid'], organizationId]
            );

            return Number(rows[0]['count']);
        } else {

            return super.count({organizationId, filters});
        }
    }
}

export default Datapoint;
