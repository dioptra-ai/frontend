import {postgresClient} from './index.mjs';

class Suggestion {

    static async findKeySuggestions(key) {
        console.log(key);
        const {rows} = await postgresClient.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = 'tags' 
            AND column_name LIKE $1`,
            [`%${key}%`]
        );

        // console.log(rows);

        return rows;
    }

    static async findValueSuggestions(organizationId, key, value) {
        // parse value
        const {rows} = await postgresClient.query(
            `SELECT value FROM tags WHERE organization_id = $1 AND 
            name = $2 AND
            value LIKE $3`,
            [organizationId, key, `%${value}%`]
        );

        // console.log(rows);

        return rows;
    }


}

export default Suggestion;
