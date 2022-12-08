import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Datapoint from '../models/datapoint.mjs';

const DatapointsRouter = express.Router();

DatapointsRouter.all('*', isAuthenticated);

DatapointsRouter.get('/', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datapoints = await Datapoint.findAll(activeOrganizationMembership.organization._id);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.get('/:id', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datapoint = await Datapoint.findById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(datapoint);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/from-event-uuids', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datapoints = await Datapoint.upsertByEventUuids(activeOrganizationMembership.organization._id, req.body.eventUuids);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.delete('/:id', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datapoint = await Datapoint.deleteById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(datapoint);
    } catch (e) {
        next(e);
    }
});

export default DatapointsRouter;
