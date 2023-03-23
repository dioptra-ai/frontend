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

GroundtruthsRouter.post('/select', async (req, res, next) => {
    try {
        const groundtruths = await Groundtruth.select({
            organizationId: req.user.requestOrganizationId,
            selectColumns: req.body.selectColumns,
            filters: req.body.filters,
            orderBy: req.body.orderBy,
            desc: req.body.desc,
            limit: req.body.limit,
            offset: req.body.offset
        });

        res.json(groundtruths);
    } catch (e) {
        next(e);
    }
});

GroundtruthsRouter.post('/delete', async (req, res, next) => {
    try {
        const groundtruths = await Groundtruth.deleteByFilters(
            req.user.requestOrganizationId,
            req.body.groundtruthIds.map((id) => ({
                'left': 'id',
                'op': '=',
                'right': id
            }))
        );

        res.json(groundtruths);
    } catch (e) {
        next(e);
    }
});

export default GroundtruthsRouter;
