import fetch from 'node-fetch';
import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';

const {OVERRIDE_DRUID_ORG_ID} = process.env;

const TasksRouter = express.Router();

TasksRouter.all('*', isAuthenticated);

TasksRouter.post('*', async (req, res, next) => {
    try {
        const taskEnginePath = `${process.env.TASK_ENGINE_URL}${req.url}`;
        const taskEngineResponse = await fetch(taskEnginePath, {
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                ...req.body,
                organization_id:
                    OVERRIDE_DRUID_ORG_ID ||
                    req.user.activeOrganizationMembership.organization._id
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

export default TasksRouter;
