import express from 'express';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import {isAuthenticated} from '../middleware/authentication.mjs';

const REDASH_URL = 'http://18.217.55.105';

const RedashRouter = express.Router();

RedashRouter.all('*', isAuthenticated);

RedashRouter.get('/:id?', isAuthenticated, async (req, res, next) => {
    try {
        const {id} = req.params;
        const {activeOrganizationMembership} = req.user;
        const IntegrationModel = mongoose.model('Integrations');

        const integrationData = await IntegrationModel.findOne({organization: activeOrganizationMembership.organization._id});

        let redashResponse = null;

        if (!id) {
            redashResponse = await fetch(`${REDASH_URL}/api/queries?api_key=${integrationData.apiKey}`);
        } else {
            redashResponse = await fetch(`${REDASH_URL}/api/queries/${id}/results?api_key=${integrationData.apiKey}`);
        }

        redashResponse.body.pipe(res.status(redashResponse.status));

    } catch (e) {
        next(e);
    }
});

export default RedashRouter;
