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

PredictionsRouter.post('/delete', async (req, res, next) => {
    try {
        const predictions = await Prediction.deleteByIds(req.user.requestOrganizationId, req.body.predictionIds);

        res.json(predictions);
    } catch (e) {
        next(e);
    }
});

export default PredictionsRouter;
