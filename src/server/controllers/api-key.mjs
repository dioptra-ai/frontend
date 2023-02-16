import express from 'express';
import mongoose from 'mongoose';
import {
    APIGatewayClient,
    CreateApiKeyCommand, CreateUsagePlanKeyCommand,
    DeleteApiKeyCommand
} from '@aws-sdk/client-api-gateway';

import {isAuthenticated} from '../middleware/authentication.mjs';

const {AWS_ACCESS_KEY_ID, AWS_API_GATEWAY_PLAN_ID} = process.env;

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
        const dioptraUserId = req.user._id;
        const requestOrganization = req.user.requestOrganization;
        const dioptraOrganizationId = requestOrganization._id;
        const dioptraApiKey = new ApiKey({
            user: req.user._id,
            organization: requestOrganization._id
        });

        let awsApiKey = {
            id: `__api_key_id__${Date.now()}__`,
            value: `__api_key_value__${Date.now()}__`
        };

        if (AWS_ACCESS_KEY_ID) {

            awsApiKey = await client.send(new CreateApiKeyCommand({
                enabled: true,
                name: `${dioptraApiKey._id} (as: ${req.user.username} | ${requestOrganization.name})`,
                tags: {
                    dioptraUserId, dioptraOrganizationId,
                    dioptraApiKeyId: dioptraApiKey._id
                }
            }));

            await client.send(new CreateUsagePlanKeyCommand({
                keyId: awsApiKey.id,
                keyType: 'API_KEY',
                // TODO: Change this depending on what plan the organization is on when people are paying us.
                usagePlanId: AWS_API_GATEWAY_PLAN_ID
            }));
        }


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

        if (AWS_ACCESS_KEY_ID) {
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
