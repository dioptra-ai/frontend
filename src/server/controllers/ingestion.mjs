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
    AWS_INGESTION_STATE_MACHINE_ARN,
    LOCAL_INGESTION_VOLUME_PATH = '/app/data-upload'
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
    if (ENVIRONMENT === 'local-dev') {
        next(new Error('Upload history not available in local-dev mode. Deploy in a cloud environment to view upload history. But you can still upload data!'));
    } else {
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
    }
});

IngestionRouter.post('/upload', (req, res, next) => {
    try {
        const fileName = `${md5(Math.random().toString())}.ndjson`;
        const key = `${ENVIRONMENT}/${req.user.requestOrganizationId}/${fileName}`;
        const form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                next(err);

                return;
            }

            try {
                const file = files['file'][0];

                if (ENVIRONMENT === 'local-dev') {
                    const local_file = `${LOCAL_INGESTION_VOLUME_PATH}/${fileName}`;

                    await fs.readFile(file.path, (err, data) => {
                        if (err) {
                            throw err;
                        }
                        fs.writeFile(local_file, data, (err) => {
                            if (err) {
                                throw err;
                            }
                            res.json({'url': local_file});
                        });
                    });

                } else {

                    await s3Client.send(new PutObjectCommand({
                        Bucket: AWS_S3_CUSTOMER_BUCKET,
                        Key: key,
                        Body: fs.createReadStream(file.path),
                        ContentType: 'application/json'
                    }));

                    res.json({
                        'url': await getSignedUrl(s3Client, new GetObjectCommand({
                            Bucket: AWS_S3_CUSTOMER_BUCKET,
                            Key: key
                        }), {
                            expiresIn: AWS_S3_CUSTOMER_UPLOAD_EXPIRATION_SECONDS
                        })
                    });
                }
            } catch (e) {
                next(e);
            }
        });

    } catch (e) {
        console.error('Error while uploading file: ', e);
        next(e);
    }
});

IngestionRouter.post('/ingest', async (req, res, next) => {
    const ApiKey = mongoose.model('ApiKey');

    try {
        let firstKey = await ApiKey.findOne({
            user: req.user._id,
            organization: req.user.requestOrganizationId
        });

        if (!firstKey) {
            firstKey = await ApiKey.createApiKeyForUser(req.user);
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
