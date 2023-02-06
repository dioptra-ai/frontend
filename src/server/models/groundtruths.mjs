import {postgresClient} from './index.mjs';

class Groundtruth {
    static async findByDatapointIds(organizationId, datapointIds) {
        const {rows} = await postgresClient.query(
            `SELECT * FROM groundtruths WHERE organization_id = $1 AND 
            datapoint IN (${datapointIds.map((_, i) => `$${i + 2}`).join(',')})`,
            [organizationId, ...datapointIds]
        );

        return rows;
    }


}

export default Groundtruth;
