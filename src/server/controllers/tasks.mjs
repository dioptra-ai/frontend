import axios from 'axios';
import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';

const TasksRouter = express.Router();

TasksRouter.all('*', isAuthenticated);

TasksRouter.get('/alerts/list', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);

        await axios
            .get(
                `${process.env.ALERTS_SERVICE_URL}/alerts?organization_id=${organizationId}`
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
                `${process.env.ALERTS_SERVICE_URL}/alert?organization_id=${organizationId}`,
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
                `${process.env.ALERTS_SERVICE_URL}/alert?alert_id=${alertId}&organization_id=${organizationId}`
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

TasksRouter.get('/alerts/events/list', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);

        await axios
            .get(
                `${process.env.ALERTS_SERVICE_URL}/alert/events?organization_id=${organizationId}`
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
                `${process.env.ALERTS_SERVICE_URL}/alert/event/resolve?organization_id=${organizationId}`,
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

export default TasksRouter;
