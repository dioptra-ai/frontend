import express from 'express';
import fetch from 'node-fetch';

const TimeseriesRouter = express.Router();

TimeseriesRouter.post('/', async (req, res, next) => {

    try {
        const druidResponse = await fetch('http://afb690a980a2d4c5684bf7a2a4aa4881-820681075.us-east-2.elb.amazonaws.com:8888/druid/v2/sql', {
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
