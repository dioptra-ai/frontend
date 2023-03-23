import {postgresClient} from './index.mjs';

import SelectableModel from './selectable-model.mjs';

class Groundtruth extends SelectableModel {
    static getTableName() {
        return 'groundtruths';
    }

    static async findByDatapointIds(organizationId, datapointIds) {
        if (!datapointIds.length) {

            return [];
        } else {
            const {rows} = await postgresClient.query(
                `SELECT id, datapoint, task_type, class_name, class_names, 
                        segmentation_class_mask, top, "left", height, width
                 FROM groundtruths WHERE organization_id = $1 AND datapoint = ANY($2)`,
                [organizationId, datapointIds]
            );

            return rows;
        }
    }
}

export default Groundtruth;
