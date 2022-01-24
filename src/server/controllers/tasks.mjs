import axios from 'axios';
import express from 'express';
import fetch from 'node-fetch';
import {isAuthenticated} from '../middleware/authentication.mjs';

const {OVERRIDE_DRUID_ORG_ID, ALERTS_SERVICE_URL} = process.env;

const TasksRouter = express.Router();

TasksRouter.all('*', isAuthenticated);

TasksRouter.get('/alerts/list/:page', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);
        const {page} = req.params;

        await axios
            .get(
                `${ALERTS_SERVICE_URL}/alerts?organization_id=${organizationId}&page=${page}`
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

TasksRouter.post('/alerts/add', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);
        const payload = req.body;

        await axios
            .post(
                `${ALERTS_SERVICE_URL}/alert?organization_id=${organizationId}`,
                payload
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

TasksRouter.delete('/alerts/delete/:alertId', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);
        const {alertId} = req.params;

        await axios
            .delete(
                `${ALERTS_SERVICE_URL}/alert?alert_id=${alertId}&organization_id=${organizationId}`
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

TasksRouter.get('/alerts/events/list/:page', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);
        const {page} = req.params;

        await axios
            .get(
                `${ALERTS_SERVICE_URL}/alert/events?organization_id=${organizationId}&page=${page}`
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

TasksRouter.post('/alerts/event/resolve', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);
        const payload = req.body;

        await axios
            .post(
                `${ALERTS_SERVICE_URL}/alert/event/resolve?organization_id=${organizationId}`,
                payload
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

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
