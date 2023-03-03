import {postgresClient} from './index.mjs';

class Prediction {
    static async findByDatapointIds(organizationId, datapointIds) {
        if (!datapointIds.length) {

            return [];
        } else {
            const {rows} = await postgresClient.query(
                'SELECT * FROM predictions WHERE organization_id = $1 AND datapoint = ANY($2)',
                [organizationId, datapointIds]
            );

            return rows;
        }
    }
}

export default Prediction;
