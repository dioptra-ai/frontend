import {postgresClient} from './index.mjs';

class Suggestion {

    static async findKeySuggestions(key) {
        console.log(key);
        // Check if key is a table name or column name by checking how many '.' are in the key
        const keyParts = key.split('.');

        let tableName = '';

        let columnName = '';

        // Defined in case the key has more than 2 parts
        const rows = [];

        if (keyParts.length === 1) {
            tableName = keyParts[0];
            const {rows} = await postgresClient.query(
                'SELECT table_name FROM information_schema.tables WHERE table_name LIKE $1 AND table_schema = \'public\'',
                [`%${tableName}%`]
            );


            return rows;
        } else if (keyParts.length === 2) {
            tableName = keyParts[0];
            columnName = keyParts[1];
            const {rows} = await postgresClient.query(
                'SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name LIKE $2',
                [tableName, `%${columnName}%`]
            );


            return rows;
        }
        // console.log(rows);

        return rows;
    }

    static async findValueSuggestions(organizationId, key, value) {
        // parse value
        const keyParts = key.split('.');

        let tableName = '';

        let columnName = '';

        const rows = [];

        if (keyParts.length === 1) {
            tableName = keyParts[0];
            const {rows} = await postgresClient.query(
                'SELECT "value" FROM $2 WHERE organization_id = $1 AND * LIKE $3',
                [organizationId, tableName, `%${value}%`]
            );


            return rows;
        } else if (keyParts.length === 2) {
            tableName = keyParts[0];
            console.log(tableName);
            columnName = keyParts[1];
            const {rows} = await postgresClient.query(
                // Select values from the table where the table name is the same as tableName, column name is the same as columnName, and the value is like the value
                `SELECT ${columnName} FROM ${tableName} WHERE organization_id = $1 AND $2 LIKE $3`,
                [organizationId, columnName, `%${value}%`]
            );


            return rows;
        }

        return rows;
    }


}

export default Suggestion;
