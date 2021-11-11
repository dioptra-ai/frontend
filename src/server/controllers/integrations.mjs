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

        const integrationExists = await IntegrationModel.findOne({
            organization: activeOrganizationMembership.organization._id
        });

        let integration = null;

        if (integrationExists) {
            integration = await IntegrationModel.findByIdAndUpdate(
                integrationExists._id,
                {
                    apiKey,
                    endpoint,
                    addedBy,
                    organization: activeOrganizationMembership.organization._id
                },
                {new: true}
            );
        } else {
            integration = await IntegrationModel.create({
                apiKey,
                endpoint,
                addedBy,
                organization: activeOrganizationMembership.organization._id
            });
        }

        res.send(integration);
    } catch (e) {
        next(e);
    }
});

IntegrationRouter.get('/:orgId', async (req, res, next) => {
    try {
        const IntegrationModel = mongoose.model('Integrations');

        const integration = await IntegrationModel.findOne({
            organization: req.params.orgId
        });

        res.send(integration);
    } catch (e) {
        next(e);
    }
});

export default IntegrationRouter;
