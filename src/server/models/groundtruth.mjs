import {postgresClient} from './index.mjs';

class Groundtruth {
    static async findByDatapointIds(organizationId, datapointIds, fields) {
        if (!datapointIds.length) {
            return [];
        } else {
            if (fields == null){
                sql_fields = '*'
            } else {
                sql_fields = fields.join(', ')
            }
            const {rows} = await postgresClient.query(
                'SELECT $3 FROM groundtruths WHERE organization_id = $1 AND datapoint = ANY($2)',
                [organizationId, datapointIds, sql_fields]
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
