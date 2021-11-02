import express from 'express';
import fetch from 'node-fetch';
import {isAuthenticated} from '../middleware/authentication.mjs';

const MetricsRouter = express.Router();

MetricsRouter.all('*', isAuthenticated);

MetricsRouter.post('/', isAuthenticated, async (req, res, next) => {

    try {
        const metricsResponse = await fetch(`${process.env.METRICS_ENGINE_URL}/compute`, {
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(req.body),
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
