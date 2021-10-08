import express from 'express';
import fetch from 'node-fetch';
import {isAuthenticated} from '../middleware/authentication.mjs';

const MetricsRouter = express.Router();

MetricsRouter.all('*', isAuthenticated);

MetricsRouter.post('/', isAuthenticated, async (req, res, next) => {

    try {
        // TODO: change this to the metrics service
        const druidResponse = await fetch(`${process.env.METRICS_ENGINE_URL}/compute`, {
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(req.body),
            method: 'post'
        });

        druidResponse.body.pipe(res);
    } catch (e) {
        next(e);
    }
});

export default MetricsRouter;
