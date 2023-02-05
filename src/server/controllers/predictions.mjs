import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Prediction from '../models/predictions.mjs';

const PredictionsRouter = express.Router();

PredictionsRouter.all('*', isAuthenticated);

PredictionsRouter.get('/', async (req, res, next) => {
    try {
        const predictions = await Prediction.findById(req.user.activeOrganizationId, req.body.datapointIds);

        res.json(predictions);
    } catch (e) {
        next(e);
    }
});

export default PredictionsRouter;
