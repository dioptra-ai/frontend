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

PredictionsRouter.post('/select-distinct', async (req, res, next) => {
    try {
        const predictions = await Prediction.selectDistinct({
            organizationId: req.user.requestOrganizationId,
            column: req.body.column,
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

PredictionsRouter.post('/delete', async (req, res, next) => {
    try {
        const predictions = await Prediction.deleteByFilters(
            req.user.requestOrganizationId,
            req.body.predictionIds.map((id) => ({
                'left': 'id',
                'op': '=',
                'right': id
            }))
        );

        res.json(predictions);
    } catch (e) {
        next(e);
    }
});

export default PredictionsRouter;
