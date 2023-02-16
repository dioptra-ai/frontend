import fetch from 'node-fetch';
import axios from 'axios';
import express from 'express';
import url from 'url';
import zlib from 'zlib';
import {isAuthenticated} from '../middleware/authentication.mjs';

const axiosClient = axios.create({
    validateStatus: () => true
});
const MetricsRouter = express.Router();

MetricsRouter.all('*', isAuthenticated);

MetricsRouter.get('/integrations/:sourceName', async (req, res, next) => {
    try {
        const sourceName = req.params.sourceName;
        const organization_id = req.user.requestOrganizationId;

        await axiosClient
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
        const organization_id = req.user.requestOrganizationId;
        const parameters = req.body;

        await axiosClient
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
            const organization_id = req.user.requestOrganizationId;
            const payload = req.body;

            await axiosClient
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
            'organization_id', req.user.requestOrganizationId
        );

        const newurl = {...originalUrl, search: originalQS.toString()};
        const metricsEnginePath = `${process.env.METRICS_ENGINE_URL}${url.format(
            newurl
        )}`;
        const metricsResponse = await fetch(metricsEnginePath);

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
            timeout: 300000,
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                user_id: req.user.id,
                organization_id: req.user.requestOrganizationId
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
