import {postgresClient} from './index.mjs';

class Groundtruth {
    static async findByDatapointIds(organizationId, datapointIds) {
        if (!datapointIds.length) {

            return [];
        } else {
            const {rows} = await postgresClient.query(
                'SELECT * FROM groundtruths WHERE organization_id = $1 AND datapoint = ANY($2)',
                [organizationId, datapointIds]
            );

            return rows;
        }
    }
}

export default Groundtruth;
