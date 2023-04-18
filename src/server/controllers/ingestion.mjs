import fs from 'fs';
import fetch from 'node-fetch';
import express from 'express';
import multiparty from 'multiparty';
import mongoose from 'mongoose';
import {DescribeExecutionCommand, SFNClient, paginateListExecutions} from '@aws-sdk/client-sfn';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import md5 from 'md5';
import {
    GetObjectCommand, PutObjectCommand, S3Client
} from '@aws-sdk/client-s3';

import {isAuthenticated} from '../middleware/authentication.mjs';

const {
    AWS_S3_CUSTOMER_BUCKET,
    AWS_S3_CUSTOMER_BUCKET_REGION = 'us-east-2',
    AWS_S3_CUSTOMER_UPLOAD_EXPIRATION_SECONDS = 3600,
    ENVIRONMENT,
    INGESTION_ENDPOINT,
    AWS_INGESTION_STATE_MACHINE_ARN
} = process.env;
const s3Client = new S3Client({region: AWS_S3_CUSTOMER_BUCKET_REGION});

const IngestionRouter = express.Router();

IngestionRouter.all('*', isAuthenticated);

IngestionRouter.get('/executions/:id', async (req, res, next) => {
    try {
        const execution = await new SFNClient({region: 'us-east-2'}).send(new DescribeExecutionCommand({
            executionArn: Buffer.from(req.params.id, 'base64').toString('utf-8')
        }));

        let errorMessage = '';

        if (execution.cause) {
            try {
                const cause = JSON.parse(execution.cause);

                if (cause.errorMessage) {
                    errorMessage = cause.errorMessage;
                } else if (cause.error) {
                    errorMessage = cause.error;
                }
            } catch (e) {
                errorMessage = execution.cause;
            }
        }

        res.json({
            input: JSON.parse(execution.input),
            output: execution.output ? JSON.parse(execution.output) : undefined,
            status: execution.status,
            errorMessage,
            startDate: execution.startDate,
            stopDate: execution.stopDate,
            durationMs: execution.stopDate ? execution.stopDate - execution.startDate : undefined
        });
    } catch (e) {
        next(e);
    }
});

IngestionRouter.get('/executions', async (req, res, next) => {
    try {
        const paginator = paginateListExecutions({
            client: new SFNClient({region: 'us-east-2'}),
            pageSize: 1000
        }, {
            stateMachineArn: AWS_INGESTION_STATE_MACHINE_ARN,
            maxResults: 1000
        });
        const executions = [];

        for await (const page of paginator) {
            for (const e of page.executions) {
                // Break if we already have 100 executions or if the execution is older than 24 hours
                if (executions.length >= 100 || new Date().getTime() - new Date(e['startDate']).getTime() > 24 * 60 * 60 * 1000) {

                    res.json(executions);

                    return;
                } else if (e['name'].startsWith(`ingestion-${req.user.requestOrganizationId}`)) {
                    executions.push({
                        id: Buffer.from(e['executionArn']).toString('base64'),
                        status: e['status'],
                        startDate: e['startDate'],
                        stopDate: e['stopDate']
                    });
                }
            }
        }

        res.json(executions);
    } catch (e) {
        next(e);
    }
});

IngestionRouter.post('/upload', (req, res, next) => {
    try {
        const key = `${ENVIRONMENT}/${req.user.requestOrganizationId}/${md5(Math.random().toString())}.ndjson`;
        const form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                next(err);

                return;
            }

            console.log('~/dioptra/services/frontend/src/server/controllers/ingestion.mjs:112 > ', files);

            const file = files['file'][0];
            const fileStream = fs.createReadStream(file.path);

            await s3Client.send(new PutObjectCommand({
                Bucket: AWS_S3_CUSTOMER_BUCKET,
                Key: key,
                Body: fileStream,
                ContentType: 'application/json'
            }));

            res.end(await getSignedUrl(s3Client, new GetObjectCommand({
                Bucket: AWS_S3_CUSTOMER_BUCKET,
                Key: key
            }), {
                expiresIn: AWS_S3_CUSTOMER_UPLOAD_EXPIRATION_SECONDS
            }));
        });
    } catch (e) {
        console.error('Error while uploading file: ', e);
        next(e);
    }
});

IngestionRouter.post('/ingest', async (req, res, next) => {
    try {
        const firstKey = await mongoose.model('ApiKey').findOne({
            user: req.user._id,
            organization: req.user.requestOrganizationId
        });

        if (!firstKey) {
            res.status(401);
            throw new Error('At least one API key is needed to ingest data, but none was found for this user.');
        }

        const ingestionResponse = await fetch(INGESTION_ENDPOINT, {
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
