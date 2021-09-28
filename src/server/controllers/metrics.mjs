import express from 'express';
import fetch from 'node-fetch';

const MetricsRouter = express.Router();

MetricsRouter.post('/', async (req, res, next) => {

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
        console.log(e);
        next(e);
    }
});

export default MetricsRouter;
