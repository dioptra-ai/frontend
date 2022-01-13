import axios from 'axios';
import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';

const AlertsRouter = express.Router();

const conditionSourceMapper = (metric, organizationId, sqlFilters, modelType) => {
    return {
        F1_SCORE: {
            method: 'POST',
            url: 'http://localhost:4006/f1-score-metric',
            body: {
                sql_filters: sqlFilters,
                model_type: modelType.toUpperCase(),
                organization_id: organizationId
            }
        }
    }[metric];
};

AlertsRouter.all('*', isAuthenticated);

AlertsRouter.get('/list', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = activeOrganizationMembership.organization._id;

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

AlertsRouter.get('/events/list', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = activeOrganizationMembership.organization._id;

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

AlertsRouter.post('/add', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const organizationId = String(activeOrganizationMembership.organization._id);
        const parameters = req.body;

        parameters.organization_id = organizationId;
        for (let i = 0; i < parameters.conditions.length; i++) {
            parameters.conditions[i].integration = conditionSourceMapper(
                parameters.conditions[i].metric,
                organizationId,
                parameters.sqlFilters,
                parameters.modelType
            );
        }
        delete parameters.sqlFilters;
        await axios
            .post(
                `${process.env.ALERTS_SERVICE_URL}/alert?org_id=${organizationId}`,
                parameters
            )
            .then((response) => {
                res.status(response.status);
                res.json(response.data);
            });
    } catch (e) {
        next(e);
    }
});

export default AlertsRouter;
