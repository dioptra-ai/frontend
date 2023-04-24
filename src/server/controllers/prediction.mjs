import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Prediction from '../models/prediction.mjs';

const PredictionsRouter = express.Router();

PredictionsRouter.all('*', isAuthenticated);

PredictionsRouter.post('/get', async (req, res, next) => {
    try {
        const predictions = await Prediction.findByDatapointIds(req.user.requestOrganizationId, req.body.datapointIds);

        res.json(predictions);
    } catch (e) {
        next(e);
    }
});

PredictionsRouter.post('/select', async (req, res, next) => {
    try {
        const predictions = await Prediction.select({
            organizationId: req.user.requestOrganizationId,
            selectColumns: req.body.selectColumns,
            filters: req.body.filters,
            orderBy: req.body.orderBy,
            desc: req.body.desc,
            limit: req.body.limit,
            offset: req.body.offset
        });

        res.json(predictions);
    } catch (e) {
        next(e);
    }
});

PredictionsRouter.post('/select-distinct-model-names', async (req, res, next) => {

    try {
        const predictions = await Prediction.selectDistinctModelNames({
            organizationId: req.user.requestOrganizationId,
            datapointFilters: req.body.datapointFilters,
            filters: req.body.filters,
            datasetId: req.body.datasetId,
            limit: req.body.limit,
            offset: req.body.offset
        });

        res.json(predictions);
    } catch (e) {
        next(e);
    }
});

PredictionsRouter.post('/delete', async (req, res, next) => {
    try {
        const predictions = await Prediction.deleteByFilters({
            ...req.body,
            organizationId: req.user.requestOrganizationId
        });

        res.json(predictions);
    } catch (e) {
        next(e);
    }
});

export default PredictionsRouter;
