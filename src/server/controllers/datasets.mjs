import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import DatasetVersion from '../models/dataset_version.mjs';
import Datapoint from '../models/datapoint.mjs';

const DatasetsRouter = express.Router();

DatasetsRouter.all('*', isAuthenticated);

DatasetsRouter.post('/version', async (req, res, next) => {
    try {
        const {_id: createdBy, activeOrganizationMembership} = req.user;

        if (req.body.uuid) {
            const dataset = await DatasetVersion.updateById(
                activeOrganizationMembership.organization._id,
                req.body.uuid,
                req.body.displayName
            );

            res.json(dataset);
        } else {
            const dataset = await DatasetVersion.createNew(activeOrganizationMembership.organization._id, req.body.displayName, createdBy, req.body.parentUuid);

            res.json(dataset);
        }
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/version', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datasets = await DatasetVersion.findAll(activeOrganizationMembership.organization._id);

        res.json(datasets);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/version/:id', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await DatasetVersion.findById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.put('/version/:id', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await DatasetVersion.updateById(activeOrganizationMembership.organization._id, req.params.id, req.body.displayName);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.delete('/version/:id', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await DatasetVersion.deleteById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/version/:id/datapoints', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;

        let datapointIds = req.body.datapointIds;

        if (req.body.requestIds) {
            const datapoints = await Datapoint.upsertMany(activeOrganizationMembership.organization._id, req.body.requestIds);

            datapointIds = datapoints.map((datapoint) => datapoint['uuid']);
        }

        const dataset = await DatasetVersion.addDatapointsById(activeOrganizationMembership.organization._id, req.params.id, datapointIds);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.delete('/version/:id/datapoints', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await DatasetVersion.removeDatapointsById(activeOrganizationMembership.organization._id, req.params.id, req.body.datapointIds);

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/version/:id/datapoints', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datapoints = await DatasetVersion.getDatapointsById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/version/:id/datapoints/count', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const count = await DatasetVersion.countDatapointsById(activeOrganizationMembership.organization._id, req.params.id);

        res.json(count);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/version/:datasetVersionId/same-parent', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const versions = await DatasetVersion.getAllFromSameRootParent(activeOrganizationMembership.organization._id, req.params.datasetVersionId);

        res.json(versions);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/version/:datasetVersionId/same-parent-current', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datasetVersion = await DatasetVersion.setCurrentFromSameParent(activeOrganizationMembership.organization._id, req.params.datasetVersionId, req.body.datasetVersionId);

        res.json(datasetVersion);
    } catch (e) {
        next(e);
    }
});

export default DatasetsRouter;
