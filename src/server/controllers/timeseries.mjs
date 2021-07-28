import express from 'express';
import fetch from 'node-fetch';

const TimeseriesRouter = express.Router();

TimeseriesRouter.post('/', async (req, res, next) => {

    try {
        // TODO: make this a config parameter
        const druidResponse = await fetch('http://af01bd8d1c0224ad0ab1965180db3208-900054666.us-east-2.elb.amazonaws.com:8888/druid/v2/sql', {
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
