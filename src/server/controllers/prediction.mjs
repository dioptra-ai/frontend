import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Prediction from '../models/prediction.mjs';

const PredictionsRouter = express.Router();

PredictionsRouter.all('*', isAuthenticated);

PredictionsRouter.post('/', async (req, res, next) => {
    try {
        const predictions = await Prediction.findByDatapointIds(req.user.activeOrganizationId, req.body.datapointIds);

        res.json(predictions);
    } catch (e) {
        next(e);
    }
});

export default PredictionsRouter;
