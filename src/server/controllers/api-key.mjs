import express from 'express';
import mongoose from 'mongoose';
import {APIGatewayClient, CreateApiKeyCommand} from '@aws-sdk/client-api-gateway';

import {isAuthenticated} from '../middleware/authentication.mjs';

const client = new APIGatewayClient({region: 'us-east-2'});

const ApiKeyRouter = express.Router();

ApiKeyRouter.all('*', isAuthenticated);

ApiKeyRouter.post('/', async (req, res, next) => {

    try {
        const Key = mongoose.model('ApiKey');
        const dioptraUserId = req.user._id;
        const dioptraOrganizationId = req.user.activeOrganizationMembership.organization._id;
        const dioptraApiKey = new Key({
            user: req.user._id,
            organization: req.user.activeOrganizationMembership.organization._id
        });
        const awsApiKey = await client.send(new CreateApiKeyCommand({
            enabled: true,
            tags: {
                dioptraUserId, dioptraOrganizationId,
                dioptraApiKeyId: dioptraApiKey._id
            }
        }));

        dioptraApiKey.awsApiKeyId = awsApiKey.id;
        dioptraApiKey.awsApiKey = awsApiKey.value;

        res.json(dioptraApiKey.save());
    } catch (e) {
        next(e);
    }
});

export default ApiKeyRouter;
