import express from 'express';
import mongoose from 'mongoose';
import {APIGatewayClient, DeleteApiKeyCommand} from '@aws-sdk/client-api-gateway';

import {isAuthenticated} from '../middleware/authentication.mjs';

const {ENVIRONMENT} = process.env;

const client = new APIGatewayClient({region: 'us-east-2'});

const ApiKeyRouter = express.Router();

ApiKeyRouter.all('*', isAuthenticated);

ApiKeyRouter.get('/', async (req, res, next) => {

    try {
        const ApiKey = mongoose.model('ApiKey');

        res.json(await ApiKey.find({
            user: req.user._id,
            organization: req.user.requestOrganizationId
        }));
    } catch (e) {
        next(e);
    }
});

ApiKeyRouter.post('/', async (req, res, next) => {
    try {
        const ApiKey = mongoose.model('ApiKey');
        const dioptraApiKey = await ApiKey.createApiKeyForUser(req.user);

        res.json(dioptraApiKey);
    } catch (e) {
        next(e);
    }
});

ApiKeyRouter.delete('/:_id', async (req, res, next) => {

    try {
        const ApiKey = mongoose.model('ApiKey');
        const dioptraApiKey = await ApiKey.findOneAndDelete({
            _id: req.params._id,
            user: req.user._id
        });

        if (ENVIRONMENT !== 'local-dev') {
            await client.send(new DeleteApiKeyCommand({
                apiKey: dioptraApiKey.awsApiKeyId
            }));
        }

        res.json(dioptraApiKey);
    } catch (e) {
        next(e);
    }
});

export default ApiKeyRouter;
