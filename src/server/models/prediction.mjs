import {postgresClient} from './index.mjs';

class Prediction {
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

    static async deleteByIds(organizationId, ids) {
        const {rows} = await postgresClient.query(
            'DELETE FROM predictions WHERE id = ANY($1) AND organization_id = $2 RETURNING *',
            [ids, organizationId]
        );

        return rows;
    }
}

export default Prediction;
