import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Datapoint from '../models/datapoint.mjs';

const DatapointsRouter = express.Router();

DatapointsRouter.all('*', isAuthenticated);

DatapointsRouter.get('/', async (req, res, next) => {
    try {
        const datapoints = await Datapoint.findAll(req.user.requestOrganizationId);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.get('/:id', async (req, res, next) => {
    try {
        const datapoint = await Datapoint.findById(req.user.requestOrganizationId, req.params.id);

        res.json(datapoint);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/select', async (req, res, next) => {
    try {
        const datapoints = await Datapoint.select({
            organizationId: req.user.requestOrganizationId,
            selectColumns: req.body.selectColumns,
            filters: req.body.filters,
            orderBy: req.body.orderBy,
            desc: req.body.desc,
            limit: req.body.limit,
            offset: req.body.offset,
            datasetId: req.body.datasetId
        });

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/select-in-dataset', async (req, res, next) => {
    try {
        const datapoints = await Datapoint.selectInDataset({
            organizationId: req.user.requestOrganizationId,
            selectColumns: req.body.selectColumns,
            filters: req.body.filters,
            orderBy: req.body.orderBy,
            desc: req.body.desc,
            limit: req.body.limit,
            offset: req.body.offset,
            datasetId: req.body.datasetId
        });

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/count', async (req, res, next) => {
    try {
        const count = await Datapoint.count({
            organizationId: req.user.requestOrganizationId,
            filters: req.body.filters,
            datasetId: req.body.datasetId
        });

        res.json(count);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/find-vector-ids', async (req, res, next) => {
    try {
        const vectorIds = await Datapoint.findVectorIds(
            req.user.requestOrganizationId,
            req.body.filters,
            req.body.orderBy,
            req.body.desc,
            req.body.limit,
            req.body.offset,
            req.body.type,
            req.body.modelName
        );

        res.json(vectorIds);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/from-event-uuids', async (req, res, next) => {
    try {
        const datapoints = await Datapoint.upsertByEventUuids(req.user.requestOrganizationId, req.body.eventUuids);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatapointsRouter.post('/delete', async (req, res, next) => {
    try {
        const datapoints = await Datapoint.deleteByFilters({
            ...req.body,
            organizationId: req.user.requestOrganizationId
        });

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

export default DatapointsRouter;
