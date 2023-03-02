import express from 'express';
import mongoose from 'mongoose';
import {isAuthenticated} from '../middleware/authentication.mjs';

const IntegrationRouter = express.Router();

IntegrationRouter.all('*', isAuthenticated);

IntegrationRouter.post('/', async (req, res, next) => {
    try {
        const {_id: createdBy, id} = req.user;
        const {data, type} = req.body;
        const IntegrationModel = mongoose.model('Integrations');
        const identity = await IntegrationModel.getIdentity(data, type);

        await IntegrationModel.findOneAndUpdate(
            {
                type,
                organization: req.user.requestOrganizationId
            }, {
                data,
                type,
                createdBy,
                user: id,
                organization: req.user.requestOrganizationId
            },
            {new: true, upsert: true}
        );

        res.json({
            message: `Successfully updated credentials for identity ${identity}`
        });
    } catch (e) {
        next(e);
    }
});

IntegrationRouter.get('/:type', async (req, res, next) => {
    try {
        const IntegrationModel = mongoose.model('Integrations');

        const integration = await IntegrationModel.findOne({
            organization: req.user.requestOrganizationId,
            type: req.params.type
        });

        res.json(integration || {});
    } catch (e) {
        next(e);
    }
});

export default IntegrationRouter;
