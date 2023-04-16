import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import BBox from '../models/bbox.mjs';

const BBoxesRouter = express.Router();

BBoxesRouter.all('*', isAuthenticated);

BBoxesRouter.post('/select', async (req, res, next) => {
    try {
        const bboxes = await BBox.select({
            organizationId: req.user.requestOrganizationId,
            selectColumns: req.body.selectColumns,
            filters: req.body.filters,
            orderBy: req.body.orderBy,
            desc: req.body.desc,
            limit: req.body.limit,
            offset: req.body.offset
        });

        res.json(bboxes);
    } catch (e) {
        next(e);
    }
});

export default BBoxesRouter;
