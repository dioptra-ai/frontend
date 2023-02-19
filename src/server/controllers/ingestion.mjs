import fetch from 'node-fetch';
import express from 'express';
import mongoose from 'mongoose';
import {DescribeExecutionCommand, SFNClient, paginateListExecutions} from '@aws-sdk/client-sfn';

import {isAuthenticated} from '../middleware/authentication.mjs';

const {INGESTION_ENDPOINT, AWS_INGESTION_STATE_MACHINE_ARN} = process.env;
const IngestionRouter = express.Router();

IngestionRouter.all('*', isAuthenticated);

IngestionRouter.get('/executions/:executionArn', async (req, res, next) => {
    try {
        const execution = await new SFNClient({region: 'us-east-2'}).send(new DescribeExecutionCommand({
            executionArn: req.params.executionArn
        }));

        res.json({
            input: JSON.parse(execution.input),
            output: JSON.parse(execution.output),
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
            pageSize: 100
        }, {
            stateMachineArn: AWS_INGESTION_STATE_MACHINE_ARN
        });
        const executions = [];

        for await (const page of paginator) {
            if (executions.length >= 100) {
                break;
            }
            executions.push(...page.executions.filter((e) => e['name'].startsWith(`ingestion-${req.user.requestOrganizationId}`)));
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
