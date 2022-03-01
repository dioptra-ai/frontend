import fetch from '@adobe/node-fetch-retry';
import axios from 'axios';
import express from 'express';
import * as rax from 'retry-axios';
import {isAuthenticated} from '../middleware/authentication.mjs';

const axiosRetryClient = axios.create();

axiosRetryClient.defaults.raxConfig = {
    instance: axiosRetryClient
};
rax.attach(axiosRetryClient);

const {OVERRIDE_DRUID_ORG_ID, TASK_ENGINE_URL} = process.env;

const TasksRouter = express.Router();

TasksRouter.all('*', isAuthenticated);

TasksRouter.get('*', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);

        await axiosRetryClient
            .get(
                `${TASK_ENGINE_URL}${req.url}${
                    req.url.includes('?') ? '&' : '?'
                }organization_id=${organizationId}`
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

TasksRouter.put('*', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);
        const taskEnginePath = `${TASK_ENGINE_URL}${req.url}${
            req.url.includes('?') ? '&' : '?'
        }organization_id=${organizationId}`;
        const taskEngineResponse = await fetch(taskEnginePath, {
            retryMaxDuration: 5000,
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                organization_id: OVERRIDE_DRUID_ORG_ID || organizationId
            }),
            method: 'put'
        });

        if (taskEngineResponse.status !== 200) {
            const json = await taskEngineResponse.json();

            res.status(taskEngineResponse.status);

            throw new Error(json.error.message);
        } else {
            taskEngineResponse.body.pipe(res);
        }
    } catch (e) {
        next(e);
    }
});

TasksRouter.post('*', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);
        const taskEnginePath = `${TASK_ENGINE_URL}${req.url}?organization_id=${organizationId}`;
        const taskEngineResponse = await fetch(taskEnginePath, {
            retryMaxDuration: 5000,
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                organization_id: OVERRIDE_DRUID_ORG_ID || organizationId
            }),
            method: 'post'
        });

        if (taskEngineResponse.status !== 200) {
            const json = await taskEngineResponse.json();

            res.status(taskEngineResponse.status);

            throw new Error(json.error.message);
        } else {
            taskEngineResponse.body.pipe(res);
        }
    } catch (e) {
        next(e);
    }
});

TasksRouter.delete('*', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);

        await axiosRetryClient
            .delete(
                `${TASK_ENGINE_URL}${req.url}${
                    req.url.includes('?') ? '&' : '?'
                }organization_id=${organizationId}`
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

export default TasksRouter;
