import fetch from 'node-fetch';
import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';

const {INGESTION_URL} = process.env;
const IngestionRouter = express.Router();

IngestionRouter.all('*', isAuthenticated);

IngestionRouter.post('*', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);
        const ingestionResponse = await fetch(`${INGESTION_URL}${req.url}?organization_id=${organizationId}`, {
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                organization_id: organizationId
            }),
            method: 'post'
        });

        if (ingestionResponse.status !== 200) {
            const json = await ingestionResponse.json();

            res.status(ingestionResponse.status);

            throw new Error(json.errorMessage);
        } else {
            ingestionResponse.body.pipe(res);
        }
    } catch (e) {
        next(e);
    }
});

export default IngestionRouter;
