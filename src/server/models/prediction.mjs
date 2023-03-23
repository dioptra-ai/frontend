import {postgresClient} from './index.mjs';

import SelectableModel from './selectable-model.mjs';

class Prediction extends SelectableModel {
    static getTableName() {
        return 'predictions';
    }

    static async findByDatapointIds(organizationId, datapointIds) {
        if (!datapointIds.length) {

            return [];
        } else {
            const {rows} = await postgresClient.query(
                `SELECT id, datapoint, task_type, class_name, class_names,
                    confidence, confidences, segmentation_class_mask, top, "left", height, width, metrics, model_name
                 FROM predictions WHERE organization_id = $1 AND datapoint = ANY($2)`,
                [organizationId, datapointIds]
            );

            return rows;
        }
    }
}

export default Prediction;
