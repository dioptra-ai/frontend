import express from 'express';
import fetch from 'node-fetch';
import {isAuthenticated} from '../middleware/authentication.mjs';

const {OVERRIDE_DRUID_ORG_ID} = process.env;

const MetricsRouter = express.Router();

MetricsRouter.all('*', isAuthenticated);

MetricsRouter.post('/:method?', async (req, res, next) => {

    try {
        const metricsEnginePath = `${process.env.METRICS_ENGINE_URL}/${req.params.method || 'compute'}`;
        const metricsResponse = await fetch(metricsEnginePath, {
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                organization_id: OVERRIDE_DRUID_ORG_ID || req.user.activeOrganizationMembership.organization._id
            }),
            method: 'post'
        });

        if (metricsResponse.status !== 200) {
            let errorMessage = 'Internal Server Error';

            try {
                errorMessage = await metricsResponse.json().then((json) => json.error.message);
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

export default MetricsRouter;
