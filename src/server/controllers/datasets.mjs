import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Dataset from '../models/dataset.mjs';

const DatasetsRouter = express.Router();

DatasetsRouter.all('*', isAuthenticated);

DatasetsRouter.post('/', async (req, res, next) => {
    try {
        const {_id: createdBy, activeOrganizationMembership} = req.user;

        if (req.body.id) {
            const dataset = await Dataset.updateById(
                activeOrganizationMembership.organization._id,
                req.body.id,
                req.body.displayName
            );

            res.json(dataset);
        } else {
            const dataset = await Dataset.createNew(activeOrganizationMembership.organization._id, req.body.displayName, createdBy);

            res.json(dataset);
        }
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datasets = await Dataset.findAll(activeOrganizationMembership.organization._id);

        res.json(datasets);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/:id', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await Dataset.findById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.put('/:id', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await Dataset.updateById(activeOrganizationMembership.organization._id, req.params.id, req.body.displayName);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.delete('/:id', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await Dataset.deleteById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/:id/datapoints', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await Dataset.addDatapointsById(activeOrganizationMembership.organization._id, req.params.id, req.body.datapointIds);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.delete('/:id/datapoints', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await Dataset.removeDatapointsById(activeOrganizationMembership.organization._id, req.params.id, req.body.datapointIds);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/:id/datapoints', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datapoints = await Dataset.findDatapointsById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/:id/datapoints/count', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const count = await Dataset.countDatapointsById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(count);
    } catch (e) {
        next(e);
    }
});

export default DatasetsRouter;
