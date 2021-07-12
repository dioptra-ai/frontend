import dotenv from 'dotenv';
import {dbConfig} from './models/index.mjs';

const serverConfig = function() {
    const result = dotenv.config();

    if (result.error) {
        throw result.error;
    }
    // Ensure required ENV vars are set
    const requiredEnv = ['PORT', 'DB_CONNECTION_URI', 'COOKIE_SECRET', 'COOKIE_DURATION_HRS', 'TIME_SERIES_DB', 'TIME_SERIES_DATA_SOURCE'];
    const unsetEnv = requiredEnv.filter((env) => !(typeof process.env[env] !== 'undefined'));

    if (unsetEnv.length > 0) {
        throw new Error(`Required ENV variables are not set: [${unsetEnv.join(', ')}]`);
    }

    dbConfig();
};

export {serverConfig};
