import mongoose from 'mongoose';
import * as pg from 'pg';

import MlModel from './ml-model.mjs';
import OrganizationMembership from './organization-membership.mjs';
import Organization from './organization.mjs';
import User from './user.mjs';
import ApiKey from './api-key.mjs';
import Integration from './integrations.mjs';

const allModels = [MlModel, OrganizationMembership, Organization, User, ApiKey, Integration];

const connectionOptions = {
    keepAlive: true
};

mongoose.connect(process.env.DB_CONNECTION_URI, connectionOptions);

mongoose.connection.on('error', console.error.bind(console, 'DB connection error:'));
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');

    allModels.forEach(async (model) => {

        if (model.hasOwnProperty('initializeCollection')) {

            try {
                await model.initializeCollection();
            } catch (e) {
                console.error(`Error initializing collection ${model.modelName}: ${e.message}`);
            }
        }
    });
});

const postgresPool = new pg.default.Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    application_name: 'frontend',
    database: 'dioptra'
});

export const postgresClient = {
    query: (text, params) => {
        console.log('PostgreSQL: ', text, params);

        return postgresPool.query(text, params);
    },
    connect: () => postgresPool.connect()
};

export const postgresTransaction = async (callback) => {
    const client = await postgresClient.connect();
    const originalQuery = client.query.bind(client);

    client.query = (...args) => {
        console.log('PostgreSQL: ', ...args);

        return originalQuery(...args);
    };

    try {
        await client.query('BEGIN');

        const result = await callback(client);

        await client.query('COMMIT');

        return result;
    } catch (e) {
        await client.query('ROLLBACK');

        throw e;
    } finally {
        client.query = originalQuery;
        client.release();
    }
};
