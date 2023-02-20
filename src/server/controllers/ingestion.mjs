import fetch from 'node-fetch';
import express from 'express';
import mongoose from 'mongoose';
import {DescribeExecutionCommand, SFNClient, paginateListExecutions} from '@aws-sdk/client-sfn';

import {isAuthenticated} from '../middleware/authentication.mjs';

const {INGESTION_ENDPOINT, AWS_INGESTION_STATE_MACHINE_ARN} = process.env;
const IngestionRouter = express.Router();

IngestionRouter.all('*', isAuthenticated);

IngestionRouter.get('/executions/:id', async (req, res, next) => {
    try {
        const execution = await new SFNClient({region: 'us-east-2'}).send(new DescribeExecutionCommand({
            executionArn: Buffer.from(req.params.id, 'base64').toString('utf-8')
        }));

        res.json({
            input: JSON.parse(execution.input),
            output: execution.output ? JSON.parse(execution.output) : undefined,
            status: execution.status,
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
            if (executions.length >= 100) {
                break;
            }
            for (const e of page.executions) {
                if (executions.length >= 100) {
                    break;
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
