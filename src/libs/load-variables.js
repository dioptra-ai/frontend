const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) throw result.error;

// // Ensure required ENV vars are set
const requiredEnv = ['PORT', 'DB_CONNECTION_URI'];
const unsetEnv = requiredEnv.filter((env) => !(typeof process.env[env] !== 'undefined'));

if (unsetEnv.length > 0) {
    throw new Error(`Required ENV variables are not set: [${unsetEnv.join(', ')}]`);
}
