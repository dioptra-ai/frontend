import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Groundtruth from '../models/groundtruth.mjs';

const GroundtruthsRouter = express.Router();

GroundtruthsRouter.all('*', isAuthenticated);

GroundtruthsRouter.post('/get', async (req, res, next) => {
    try {
        const groundtruths = await Groundtruth.findByDatapointIds(req.user.requestOrganizationId, req.body.datapointIds);

        res.json(groundtruths);
    } catch (e) {
        next(e);
    }
});

GroundtruthsRouter.post('/delete', async (req, res, next) => {
    try {
        const groundtruths = await Groundtruth.deleteByIds(req.user.requestOrganizationId, req.body.groundtruthIds);

        res.json(groundtruths);
    } catch (e) {
        next(e);
    }
});

export default GroundtruthsRouter;
