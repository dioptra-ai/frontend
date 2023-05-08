import Datapoint from './datapoint.mjs';
import {postgresClient} from './index.mjs';

import SelectableModel from './selectable-model.mjs';

class Prediction extends SelectableModel {
    static getTableName() {
        return 'predictions';
    }

    static async selectDistinctModelNames({organizationId, datapointFilters, filters, desc, limit, offset, datasetId}) {
        let safeSelectQuery = null;

        if (datasetId || datapointFilters) {
            if (datasetId) {
                safeSelectQuery = await Datapoint.getSafeSelectQueryWithDatasetId({organizationId, selectColumns: ['id'], filters: datapointFilters, datasetId});
            } else {
                safeSelectQuery = Datapoint.getSafeSelectQuery({organizationId, selectColumns: ['id'], filters: datapointFilters});
            }

            const {rows} = await postgresClient.query(
                `SELECT DISTINCT model_name
                    FROM predictions
                    WHERE organization_id = $1 AND datapoint IN (
                        SELECT id FROM (${safeSelectQuery}) AS subquery
                    )
                    ORDER BY model_name ${desc ? 'DESC' : 'ASC'}
                    LIMIT $2 OFFSET $3`,
                [organizationId, limit, offset]
            );

            return rows.map((row) => row['model_name']);
        } else {
            safeSelectQuery = Prediction.getSafeSelectQuery({organizationId, selectColumns: ['id'], filters});

            const {rows} = await postgresClient.query(
                `SELECT DISTINCT model_name
                    FROM predictions
                    WHERE organization_id = $1 AND id IN (
                        SELECT id FROM (${safeSelectQuery}) AS subquery
                    )
                    ORDER BY model_name ${desc ? 'DESC' : 'ASC'}
                    LIMIT $2 OFFSET $3`,
                [organizationId, limit, offset]
            );

            return rows.map((row) => row['model_name']);
        }
    }

    static async selectDistinctEmbeddingNames({organizationId, datapointFilters, datasetId, modelNames}) {
        const safeSelectQuery = await Datapoint.getSafeSelectQueryWithDatasetId({organizationId, selectColumns: ['id'], filters: datapointFilters, datasetId});

        const {rows} = await postgresClient.query(
            `SELECT DISTINCT feature_vectors.model_name
                FROM feature_vectors
                LEFT JOIN predictions ON feature_vectors.prediction = predictions.id
                WHERE feature_vectors.organization_id = $1 AND datapoint IN (
                        SELECT id FROM (${safeSelectQuery}) AS subquery
                    )
                    ${modelNames?.length ? 'AND predictions.model_name = ANY($2)' : ''}
                    AND feature_vectors.type = 'EMBEDDINGS'
                ORDER BY feature_vectors.model_name ASC`,
            [organizationId].concat(modelNames?.length ? [modelNames] : [])
        );

        return rows.map((row) => row['model_name']);
    }

    static async findByDatapointIds(organizationId, datapointIds) {
        if (!datapointIds.length) {

            return [];
        } else {
            const {rows} = await postgresClient.query(
                `SELECT id, datapoint, task_type, class_name, class_names,
                    confidence, confidences, top, "left", height, width, metrics, model_name
                 FROM predictions WHERE organization_id = $1 AND datapoint = ANY($2)`,
                [organizationId, datapointIds]
            );

            return rows;
        }
    }
}

export default Prediction;
