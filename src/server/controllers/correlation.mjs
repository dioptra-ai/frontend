import express from 'express';
import fetch from 'node-fetch';
import {isAuthenticated} from '../middleware/authentication.mjs';

const CorrelationRouter = express.Router();

CorrelationRouter.all('*', isAuthenticated);

CorrelationRouter.get('/', async (req, res, next) => {
    try {
        const correlationResponse = await fetch(`${process.env.METRICS_ENGINE_URL}/correlation`, {
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(req.body),
            method: 'post'
        });

        if (correlationResponse.status !== 200) {
            let errorMessage = 'Internal Server Error';

            try {
                errorMessage = await correlationResponse.json().then((json) => json.error.message);
            } catch {
                errorMessage = correlationResponse.statusText;
            }
            res.status(correlationResponse.status);
            res.send(errorMessage);
        }

        correlationResponse.body.pipe(res);
    } catch (e) {
        next(e);
    }
});

export default CorrelationRouter;
