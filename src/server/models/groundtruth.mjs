import {postgresClient} from './index.mjs';

class Groundtruth {
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

    static async deleteByIds(organizationId, ids) {
        const {rows} = await postgresClient.query(
            'DELETE FROM groundtruths WHERE id = ANY($1) AND organization_id = $2 RETURNING *',
            [ids, organizationId]
        );

        return rows;
    }
}

export default Groundtruth;
