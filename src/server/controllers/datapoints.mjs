import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Datapoint from '../models/datapoint.mjs';

const DatapointsRouter = express.Router();

DatapointsRouter.all('*', isAuthenticated);

DatapointsRouter.get('/', async (req, res, next) => {
    try {
        const datapoints = await Datapoint.findAll(req.user.activeOrganizationId);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.get('/:id', async (req, res, next) => {
    try {
        const datapoint = await Datapoint.findById(req.user.activeOrganizationId, req.params.id);

        res.json(datapoint);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/_legacy-get-datapoint-events', async (req, res, next) => {
    try {
        const events = await Datapoint._legacyFindDatapointEventsByDatapointIds(req.user.activeOrganizationId, req.body.datapointIds);

        res.json(events);
    } catch (e) {
        next(e);
    }
});


DatapointsRouter.post('/_legacy-get-groundtruth-prediction-events', async (req, res, next) => {
    try {
        const events = await Datapoint._legacyFindGroundtruthAndPredictionEventsByDatapointIds(req.user.activeOrganizationId, req.body.datapointIds);

        res.json(events);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/select', async (req, res, next) => {
    try {
        const datapoints = await Datapoint.select(req.user.activeOrganizationId, req.body.select, req.body.filters, req.body.order_by, req.body.desc, req.body.limit, req.body.offset);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/from-event-uuids', async (req, res, next) => {
    try {
        const datapoints = await Datapoint.upsertByEventUuids(req.user.activeOrganizationId, req.body.eventUuids);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.delete('/:id', async (req, res, next) => {
    try {
        const datapoint = await Datapoint.deleteById(req.user.activeOrganizationId, req.params.id);

        res.json(datapoint);
    } catch (e) {
        next(e);
    }
});

export default DatapointsRouter;
