import mongoose from 'mongoose';

import Dashboard from './dashboard.mjs';
import MlModel from './ml-model.mjs';
import OrganizationMembership from './organization-membership.mjs';
import Organization from './organization.mjs';
import User from './user.mjs';

mongoose.set('useCreateIndex', true);

const allModels = [Dashboard, MlModel, OrganizationMembership, Organization, User];

const connectionOptions = {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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
