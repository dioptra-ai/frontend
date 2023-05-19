import pgFormat from 'pg-format';

import {postgresClient} from './index.mjs';
import Datapoint from './datapoint.mjs';
import {json} from 'd3';

const OMITTED_COLUMNS = ['organization_id'];

class Suggestion {

    static async findKeySuggestions(key) {
        const [firstKeyPart, ...moreKeyParts] = key.split('.');

        let tableName = firstKeyPart;

        let columnName = moreKeyParts.join('.');

        let hardcodedSuggestions = [];

        let columnIsJsonb = '';

        let jsonbSuggestions = [];

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

        columnName = columnName.substring(0, columnName.lastIndexOf('.'));
        columnIsJsonb = (await postgresClient.query(
            'SELECT data_type FROM information_schema.columns WHERE table_name = $1 AND column_name = $2', [tableName, columnName]
        ))['rows'][0];
        columnIsJsonb = columnIsJsonb ? columnIsJsonb['data_type'] : '';

        if (columnIsJsonb === 'jsonb') {
            jsonbSuggestions = (await postgresClient.query(
                pgFormat('SELECT DISTINCT jsonb_object_keys(%I) AS value FROM %I', columnName, tableName)
            ))['rows'].map((row) => `${tableName}.${columnName}.${row['value']}`);
        }

        return [
            ...rows.map((row) => `${tableName}.${row['value']}`),
            ...hardcodedSuggestions,
            ...jsonbSuggestions
        ];
    }

    static async findValueSuggestions(organizationId, key, value = '') {
        const tableName = Datapoint.getColumnTable(key);
        const safeColumn = Datapoint.getSafeColumn(key);

        const {rows} = await postgresClient.query(
            pgFormat(`SELECT DISTINCT ${safeColumn} AS value FROM %I WHERE organization_id = $1 AND ${safeColumn}::TEXT LIKE $2`, tableName),
            [organizationId, `%${value}%`]
        );

        return rows.map((row) => row['value']);
    }
}

export default Suggestion;
