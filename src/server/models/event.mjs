import pgFormat from 'pg-format';

import {postgresClient} from './index.mjs';

const EDITABLE_JSONB_OBJECT_COLUMNS = new Set(['groundtruth']);

class Event {
    static async updateById(organizationId, id, column, value) {
        if (EDITABLE_JSONB_OBJECT_COLUMNS.has(column)) {
            const {rows} = await postgresClient.query(
                pgFormat(`
                UPDATE events SET %I = (
                    CASE WHEN jsonb_typeof(%I) = 'object' THEN %I
                        ELSE '{}'
                    END
                ) || %L 
                WHERE uuid = $1 AND organization_id = $2 RETURNING %I`, column, column, column, value, column),
                [id, organizationId]
            );

            return rows[0];
        } else {
            throw new Error('Invalid column');
        }
    }
}

export default Event;
