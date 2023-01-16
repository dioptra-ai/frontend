import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Dataset from '../models/dataset.mjs';

const DatasetsRouter = express.Router();

DatasetsRouter.all('*', isAuthenticated);

DatasetsRouter.get('/:datasetId?', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;

        if (req.params.datasetId) {
            const dataset = await Dataset.findById(activeOrganizationMembership.organization._id, req.params.datasetId);

            res.json(dataset);
        } else {
            const datasets = await Dataset.findAll(activeOrganizationMembership.organization._id);

            res.json(datasets);
        }
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/:datasetId/datapoints', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const datapoints = await Dataset.findDatapoints(activeOrganizationMembership.organization._id, req.params.datasetId);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/:datasetId/versions', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const versions = await Dataset.findVersions(activeOrganizationMembership.organization._id, req.params.datasetId);

        res.json(versions);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const dataset = await Dataset.upsert(activeOrganizationMembership.organization._id, {
            uuid: req.body['uuid'],
            display_name: req.body['displayName'],
            created_by: activeOrganizationMembership.user._id
        });

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/:datasetId/commit', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const versionId = await Dataset.commit(activeOrganizationMembership.organization._id, req.params.datasetId, req.body['message']);

        res.json(versionId);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/:datasetId/checkout/:versionId', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const versionId = await Dataset.checkout(activeOrganizationMembership.organization._id, req.params.datasetId, req.params.versionId);

        res.json(versionId);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/:datasetId/add', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;

        await Dataset.add(activeOrganizationMembership.organization._id, req.params.datasetId, req.body.datapointIds);

        res.json();
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/:datasetId/remove', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;

        await Dataset.remove(activeOrganizationMembership.organization._id, req.params.datasetId, req.body.datapointIds);

        res.json();
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.delete('/:datasetId', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;

        await Dataset.delete(activeOrganizationMembership.organization._id, req.params.datasetId);

        res.json();
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/diff/:versionId1/:versionId2', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const diff = await Dataset.diff(activeOrganizationMembership.organization._id, req.params.versionId1, req.params.versionId2);

        res.json(diff);
    } catch (e) {
        next(e);
    }
});

export default DatasetsRouter;
