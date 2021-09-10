import express from 'express';
import fetch from 'node-fetch';

const TimeseriesRouter = express.Router();

TimeseriesRouter.post('/', async (req, res, next) => {

    try {
        // TODO: make this an env variable
        const druidResponse = await fetch('http://a92314013981f428db440843327743d6-71829038.us-east-2.elb.amazonaws.com:8888/druid/v2/sql', {
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
