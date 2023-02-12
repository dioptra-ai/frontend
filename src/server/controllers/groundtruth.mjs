import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Groundtruth from '../models/groundtruth.mjs';

const GroundtruthsRouter = express.Router();

GroundtruthsRouter.all('*', isAuthenticated);

GroundtruthsRouter.post('/', async (req, res, next) => {
    try {
        const groundtruths = await Groundtruth.findByDatapointIds(req.user.activeOrganizationId, req.body.datapointIds);

        res.json(groundtruths);
    } catch (e) {
        next(e);
    }
});

export default GroundtruthsRouter;
