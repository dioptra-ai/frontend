import {postgresClient} from './index.mjs';

class Prediction {
    static async findById(organizationId, datapointIds) {
        const {rows} = await postgresClient.query(
            `SELECT * FROM predictions WHERE organization_id = $1 AND 
            datapoint IN (${datapointIds.map((_, i) => `$${i + 2}`).join(',')})`,
            [organizationId, ...datapointIds]
        );

        return rows;
    }


}

export default Prediction;
