import fetch from '@adobe/node-fetch-retry';
import axios from 'axios';
import express from 'express';
import * as rax from 'retry-axios';
import url from 'url';
import zlib from 'zlib';
import {isAuthenticated} from '../middleware/authentication.mjs';

const axiosRetryClient = axios.create();

axiosRetryClient.defaults.raxConfig = {
    instance: axiosRetryClient,
    statusCodesToRetry: [[503, 504]],
    retry: 15,
    retryDelay: 3000
};
rax.attach(axiosRetryClient);

const fetchRetryConfig = {
    retryOnHttpResponse (response) {
        return response.status === 503 || response.status === 504;
    }
};

const {OVERRIDE_DRUID_ORG_ID} = process.env;

const MetricsRouter = express.Router();

MetricsRouter.all('*', isAuthenticated);

MetricsRouter.get('/integrations/:sourceName', async (req, res, next) => {
    try {
        const sourceName = req.params.sourceName;
        const {activeOrganizationMembership} = req.user;
        const organization_id = activeOrganizationMembership.organization._id;

        await axiosRetryClient
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

        await axiosRetryClient
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

            await axiosRetryClient
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

MetricsRouter.get('*', async (req, res, next) => {
    try {
        const originalUrl = url.parse(req.url);
        const originalQS = new url.URLSearchParams(originalUrl.query);

        originalQS.set(
            'organization_id',
            OVERRIDE_DRUID_ORG_ID ||
                req.user.activeOrganizationMembership.organization._id
        );

        const newurl = {...originalUrl, search: originalQS.toString()};
        const metricsEnginePath = `${process.env.METRICS_ENGINE_URL}${url.format(
            newurl
        )}`;
        const metricsResponse = await fetch(metricsEnginePath, {
            retryOptions: fetchRetryConfig
        });

        if (metricsResponse.status !== 200) {
            const json = await metricsResponse.json();

            res.status(metricsResponse.status);

            throw new Error(json.error.message);
        } else {
            res.set('Content-Encoding', 'gzip');
            metricsResponse.body.pipe(zlib.createGzip()).pipe(res);
        }
    } catch (e) {
        next(e);
    }
});

MetricsRouter.post('*', async (req, res, next) => {
    try {
        const metricsEnginePath = `${process.env.METRICS_ENGINE_URL}${req.url}`;
        const metricsResponse = await fetch(metricsEnginePath, {
            retryOptions: fetchRetryConfig,
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                user_id: req.user.id,
                organization_id:
                    OVERRIDE_DRUID_ORG_ID ||
                    req.user.activeOrganizationMembership.organization._id
            }),
            method: 'post'
        });

        if (metricsResponse.status !== 200) {
            const json = await metricsResponse.json();

            res.status(metricsResponse.status);

            throw new Error(json.error.message);
        } else {
            res.set('Content-Encoding', 'gzip');
            metricsResponse.body.pipe(zlib.createGzip()).pipe(res);
        }
    } catch (e) {
        next(e);
    }
});
export default MetricsRouter;
