import express from 'express';
import fetch from 'node-fetch';

const TimeseriesRouter = express.Router();

TimeseriesRouter.post('/', async (req, res, next) => {

    try {
        // TODO: make this an env variable
        const druidResponse = await fetch(process.env.DRUID_DB_URL, {
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
