import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Dataset from '../models/dataset.mjs';

const DatasetsRouter = express.Router();

DatasetsRouter.all('*', isAuthenticated);

DatasetsRouter.get('/:datasetId?', async (req, res, next) => {
    try {
        if (req.params.datasetId) {
            const dataset = await Dataset.findById(req.user.activeOrganizationId, req.params.datasetId);

            res.json(dataset);
        } else {
            const datasets = await Dataset.findAll(req.user.activeOrganizationId);

            res.json(datasets);
        }
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/:datasetId/datapoints', async (req, res, next) => {
    try {
        const datapoints = await Dataset.findDatapoints(req.user.activeOrganizationId, req.params.datasetId);

        res.json(datapoints);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/:datasetId/versions', async (req, res, next) => {
    try {
        const versions = await Dataset.findVersions(req.user.activeOrganizationId, req.params.datasetId);

        res.json(versions);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/', async (req, res, next) => {
    try {
        const dataset = await Dataset.upsert(req.user.activeOrganizationId, {
            uuid: req.body['uuid'],
            display_name: req.body['displayName'],
            created_by: req.user._id
        });

        res.json(dataset);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/:datasetId/commit', async (req, res, next) => {
    try {
        const versionId = await Dataset.commit(req.user.activeOrganizationId, req.params.datasetId, req.body['message']);

        res.json(versionId);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/:datasetId/checkout/:versionId', async (req, res, next) => {
    try {
        const versionId = await Dataset.checkout(req.user.activeOrganizationId, req.params.datasetId, req.params.versionId);

        res.json(versionId);
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/:datasetId/add', async (req, res, next) => {
    try {

        await Dataset.add(req.user.activeOrganizationId, req.params.datasetId, req.body.datapointIds);

        res.json();
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.post('/:datasetId/remove', async (req, res, next) => {
    try {

        await Dataset.remove(req.user.activeOrganizationId, req.params.datasetId, req.body.datapointIds);

        res.json();
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.delete('/:datasetId', async (req, res, next) => {
    try {

        await Dataset.delete(req.user.activeOrganizationId, req.params.datasetId);

        res.json();
    } catch (e) {
        next(e);
    }
});

DatasetsRouter.get('/diff/:versionId1/:versionId2', async (req, res, next) => {
    try {
        const diff = await Dataset.getDiff(req.user.activeOrganizationId, req.params.versionId1, req.params.versionId2);

        res.json(diff);
    } catch (e) {
        next(e);
    }
});

export default DatasetsRouter;
