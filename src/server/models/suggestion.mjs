import pgFormat from 'pg-format';

import {postgresClient} from './index.mjs';
import Datapoint from './datapoint.mjs';

const {getColumnTable, getSafeColumn} = Datapoint;

const OMITTED_COLUMNS = ['organization_id'];

class Suggestion {

    static async findKeySuggestions(key) {
        const [firstKeyPart, ...moreKeyParts] = key.split('.');

        let tableName = firstKeyPart;

        let columnName = moreKeyParts.join('.');

        let hardcodedSuggestions = [];

        if (moreKeyParts.length === 0) {
            tableName = 'datapoints';
            columnName = firstKeyPart;
            hardcodedSuggestions = (await postgresClient.query(
                `SELECT * FROM (
                    SELECT 'datapoints' AS value
                    UNION SELECT 'predictions' AS value
                    UNION SELECT 'groundtruths' AS value
                    UNION SELECT 'tags' AS value
                ) AS suggestions WHERE value LIKE $1`,
                [`%${columnName}%`]
            ))['rows'].map((row) => `${row['value']}.`);
        }

        const {rows} = await postgresClient.query(
            pgFormat('SELECT column_name as value FROM information_schema.columns WHERE table_name = $1 AND column_name LIKE $2 and column_name NOT IN (%L)', OMITTED_COLUMNS),
            [tableName, `%${columnName}%`]
        );

        return [
            ...rows.map((row) => `${tableName}.${row['value']}`),
            ...hardcodedSuggestions
        ];
    }

    static async findValueSuggestions(organizationId, key, value = '') {
        const tableName = getColumnTable(key);
        const safeColumn = getSafeColumn(key);

        const {rows} = await postgresClient.query(
            pgFormat(`SELECT DISTINCT ${safeColumn} AS value FROM %I WHERE organization_id = $1 AND ${safeColumn} LIKE $2`, tableName),
            [organizationId, `%${value}%`]
        );

        return rows.map((row) => row['value']);
    }
}

export default Suggestion;
