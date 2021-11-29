import axios from 'axios';
import express from 'express';
import fetch from 'node-fetch';
import {isAuthenticated} from '../middleware/authentication.mjs';

const {OVERRIDE_DRUID_ORG_ID} = process.env;

const MetricsRouter = express.Router();

MetricsRouter.all('*', isAuthenticated);

MetricsRouter.post('/:method?', async (req, res, next) => {
    try {
        const metricsEnginePath = `${process.env.METRICS_ENGINE_URL}/${
            req.params.method || 'compute'
        }`;
        const metricsResponse = await fetch(metricsEnginePath, {
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                organization_id:
                    OVERRIDE_DRUID_ORG_ID ||
                    req.user.activeOrganizationMembership.organization._id
            }),
            method: 'post'
        });

        if (metricsResponse.status !== 200) {
            let errorMessage = 'Internal Server Error';

            try {
                errorMessage = await metricsResponse
                    .json()
                    .then((json) => json.error.message);
            } catch {
                errorMessage = metricsResponse.statusText;
            }
            res.status(metricsResponse.status);
            res.send(errorMessage);
        }

        metricsResponse.body.pipe(res);
    } catch (e) {
        next(e);
    }
});

MetricsRouter.get('/integrations/:sourceName', async (req, res, next) => {
    try {
        const sourceName = req.params.sourceName;
        const {activeOrganizationMembership} = req.user;
        const organization_id = activeOrganizationMembership.organization._id;

        await axios
            .get(
                `${process.env.METRICS_ENGINE_URL}/integrations/${sourceName}/queries?org_id=${organization_id}`
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

MetricsRouter.post('/integrations/:sourceName/:queryId', async (req, res, next) => {
    try {
        const {sourceName, queryId} = req.params;
        const {activeOrganizationMembership} = req.user;
        const organization_id = activeOrganizationMembership.organization._id;
        const parameters = req.body;

        await axios
            .post(
                `${process.env.METRICS_ENGINE_URL}/integrations/${sourceName}/results/${queryId}?org_id=${organization_id}`,
                parameters
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

MetricsRouter.post(
    '/integrations/correlation/:sourceName/:queryId',
    async (req, res, next) => {
        try {
            const {sourceName, queryId} = req.params;
            const {activeOrganizationMembership} = req.user;
            const organization_id = activeOrganizationMembership.organization._id;
            const payload = req.body;

            await axios
                .post(
                    `${process.env.METRICS_ENGINE_URL}/integrations/${sourceName}/correlation/${queryId}?org_id=${organization_id}`,
                    payload
                )
                .then((response) => {
                    res.status(response.status);
                    res.json(response.data);
                });
        } catch (e) {
            next(e);
        }
    }
);

export default MetricsRouter;
