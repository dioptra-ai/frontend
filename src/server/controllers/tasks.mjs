import fetch from 'node-fetch';
import axios from 'axios';
import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';

const axiosClient = axios.create();
const {TASK_ENGINE_URL} = process.env;
const TasksRouter = express.Router();

TasksRouter.all('*', isAuthenticated);

TasksRouter.get('*', async (req, res, next) => {
    try {
        const organizationId = String(req.user.requestOrganizationId);

        await axiosClient
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
        const organizationId = String(req.user.requestOrganizationId);
        const taskEnginePath = `${TASK_ENGINE_URL}${req.url}${
            req.url.includes('?') ? '&' : '?'
        }organization_id=${organizationId}`;
        const taskEngineResponse = await fetch(taskEnginePath, {
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                organization_id: organizationId
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
        const organizationId = String(req.user.requestOrganizationId);
        const taskEnginePath = `${TASK_ENGINE_URL}${req.url}?organization_id=${organizationId}`;
        const taskEngineResponse = await fetch(taskEnginePath, {
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                organization_id: organizationId
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
        const organizationId = String(req.user.requestOrganizationId);

        await axiosClient
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
