import axios from 'axios';
import express from 'express';
import fetch from 'node-fetch';
import {isAuthenticated} from '../middleware/authentication.mjs';

const MetricsRouter = express.Router();

MetricsRouter.all('*', isAuthenticated);

MetricsRouter.post('/', isAuthenticated, async (req, res, next) => {
    try {
        const metricsResponse = await fetch(
            `${process.env.METRICS_ENGINE_URL}/compute`,
            {
                headers: {
                    'content-type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify(req.body),
                method: 'post'
            }
        );

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

// eslint-disable-next-line no-unused-vars
MetricsRouter.get('/source/list', async (req, res, next) => {
    try {
        await axios
            .get(`${process.env.METRICS_ENGINE_URL}/kpi/source/list`)
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

MetricsRouter.get('/integrations/:sourceName', async (req, res, next) => {
    try {
        const sourceName = req.params.sourceName;
        const organization_id =
            req.user.activeOrganizationmembership.organization._id;

        await axios
            .get(
                `${process.env.METRICS_ENGINE_URL}/kpi/${sourceName}/queries?org_id=${organization_id}`
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

MetricsRouter.get('/integrations/:sourceName/:queryId', async (req, res, next) => {
    try {
        const {sourceName, queryId} = req.params;
        const organization_id =
            req.user.activeOrganizationmembership.organization._id;

        await axios
            .get(
                `${process.env.METRICS_ENGINE_URL}/kpi/${sourceName}/results/${queryId}?org_id=${organization_id}`
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

export default MetricsRouter;
