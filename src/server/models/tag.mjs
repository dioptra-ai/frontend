import {postgresClient} from './index.mjs';

import SelectableModel from './selectable-model.mjs';
import Datapoint from './datapoint.mjs';

class Tag extends SelectableModel {
    static getTableName() {
        return 'tags';
    }

    static async selectDistinctNames({organizationId, datapointFilters, datasetId, limit, offset}) {
        let safeSelectQuery = null;

        if (datasetId) {
            safeSelectQuery = await Datapoint.getSafeSelectQueryWithDatasetId({organizationId, selectColumns: ['id'], filters: datapointFilters, datasetId});
        } else {
            safeSelectQuery = Datapoint.getSafeSelectQuery({organizationId, selectColumns: ['id'], filters: datapointFilters});
        }

        const {rows} = await postgresClient.query(
            `SELECT DISTINCT name
                FROM tags
                WHERE organization_id = $1 AND datapoint IN (
                    SELECT id FROM (${safeSelectQuery}) AS subquery
                )
                ORDER BY name ASC
                LIMIT $2 OFFSET $3`,
            [organizationId, limit, offset]
        );

        return rows.map((row) => row['name']);
    }
}

export default Tag;
