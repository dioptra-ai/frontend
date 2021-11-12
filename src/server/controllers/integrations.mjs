import express from 'express';
import mongoose from 'mongoose';
import {isAuthenticated} from '../middleware/authentication.mjs';

const IntegrationRouter = express.Router();

IntegrationRouter.all('*', isAuthenticated);

IntegrationRouter.post('/', async (req, res, next) => {
    try {
        const {_id: addedBy, activeOrganizationMembership} = req.user;
        const {apiKey, endpoint} = req.body;
        const IntegrationModel = mongoose.model('Integrations');

        const integration = await IntegrationModel.findOneAndUpdate(
            {organization: activeOrganizationMembership.organization._id},
            {
                apiKey,
                endpoint,
                addedBy,
                organization: activeOrganizationMembership.organization._id
            },
            {new: true, upsert: true}
        );

        res.send(integration);
    } catch (e) {
        next(e);
    }
});

IntegrationRouter.get('/:type', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const IntegrationModel = mongoose.model('Integrations');

        const integration = await IntegrationModel.findOne({
            organization: activeOrganizationMembership.organization._id,
            type: req.params.type
        });

        res.send(integration);
    } catch (e) {
        next(e);
    }
});

export default IntegrationRouter;
