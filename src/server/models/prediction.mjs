import Datapoint from './datapoint.mjs';
import {postgresClient} from './index.mjs';

import SelectableModel from './selectable-model.mjs';

class Prediction extends SelectableModel {
    static getTableName() {
        return 'predictions';
    }

    static async selectDistinctModelNames({organizationId, datapointFilters, desc, limit, offset}) {
        const {rows} = await postgresClient.query(
            `SELECT DISTINCT model_name
                FROM predictions
                WHERE organization_id = $1 AND datapoint IN (
                    ${Datapoint.getSafeSelectQuery({organizationId, selectColumns: ['id'], filters: datapointFilters})}
                )
                ORDER BY model_name ${desc ? 'DESC' : 'ASC'}
                LIMIT $2 OFFSET $3`,
            [organizationId, limit, offset]
        );

        return rows;
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
