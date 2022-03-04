import express from 'express';
import fetch from '@adobe/node-fetch-retry';
import {isAuthenticated} from '../middleware/authentication.mjs';

const TimeseriesRouter = express.Router();

TimeseriesRouter.all('*', isAuthenticated);

TimeseriesRouter.post('/', async (req, res, next) => {
    try {
        const druidResponse = await fetch(process.env.DRUID_DB_URL, {
            retryOptions: {
                retryMaxDuration: 5000,
                retryOnHttpResponse (response) {
                    if (response.status === 503 || response.status === 504) {
                        return true;
                    }

                    return false;
                }
            },
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

export default TimeseriesRouter;
