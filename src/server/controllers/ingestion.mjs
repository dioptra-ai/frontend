import fetch from 'node-fetch';
import express from 'express';
import mongoose from 'mongoose';
import {isAuthenticated} from '../middleware/authentication.mjs';

const {INGESTION_ENDPOINT} = process.env;
const IngestionRouter = express.Router();

IngestionRouter.all('*', isAuthenticated);

IngestionRouter.post('*', async (req, res, next) => {
    try {
        const firstKey = await mongoose.model('ApiKey').findOne({
            user: req.user._id,
            organization: req.user.requestOrganizationId
        });

        if (!firstKey) {
            res.status(401);
            throw new Error('At least one API key is needed to ingest data, but none was found for this user.');
        }

        const ingestionResponse = await fetch(`${INGESTION_ENDPOINT}${req.url}`, {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'x-api-key': firstKey.awsApiKey
            },
            body: JSON.stringify(req.body),
            method: 'post'
        });

        res.status(ingestionResponse.status);
        ingestionResponse.body.pipe(res);
    } catch (e) {
        next(e);
    }
});

export default IngestionRouter;
