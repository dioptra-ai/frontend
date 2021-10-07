import express from 'express';
import mongoose from 'mongoose';
// import {APIGatewayClient, CreateApiKeyCommand, DeleteApiKeyCommand} from '@aws-sdk/client-api-gateway';

import {isAuthenticated} from '../middleware/authentication.mjs';

// const client = new APIGatewayClient({region: 'us-east-2'});

const ApiKeyRouter = express.Router();

ApiKeyRouter.all('*', isAuthenticated);

ApiKeyRouter.post('/', async (req, res, next) => {

    try {
        const ApiKey = mongoose.model('ApiKey');
        // const dioptraUserId = req.user._id;
        // const dioptraOrganizationId = req.user.activeOrganizationMembership.organization._id;
        const dioptraApiKey = new ApiKey({
            user: req.user._id,
            organization: req.user.activeOrganizationMembership.organization._id
        });

        // Hard-coding for now so Adnan can work.
        const awsApiKey = {
            id: 'foobar',
            value: 'foobar'
        };

        // const awsApiKey = await client.send(new CreateApiKeyCommand({
        //     enabled: true,
        //     tags: {
        //         dioptraUserId, dioptraOrganizationId,
        //         dioptraApiKeyId: dioptraApiKey._id
        //     }
        // }));

        dioptraApiKey.awsApiKeyId = awsApiKey.id;
        dioptraApiKey.awsApiKey = awsApiKey.value;

        res.json(await dioptraApiKey.save());
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

        // const awsApiKey = await client.send(new DeleteApiKeyCommand({
        //     apiKey: dioptraApiKey.awsApiKeyId
        // }));

        res.json(dioptraApiKey);
    } catch (e) {
        next(e);
    }
});

export default ApiKeyRouter;
