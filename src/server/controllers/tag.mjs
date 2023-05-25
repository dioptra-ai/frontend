import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Tag from '../models/tag.mjs';

const TagsRouter = express.Router();

TagsRouter.all('*', isAuthenticated);

TagsRouter.post('/select-distinct-names', async (req, res, next) => {
    try {
        const tags = await Tag.selectDistinctNames({
            organizationId: req.user.requestOrganizationId,
            datapointFilters: req.body.datapointFilters,
            datasetId: req.body.datasetId,
            limit: req.body.limit,
            offset: req.body.offset
        });

        res.json(tags);
    } catch (e) {
        next(e);
    }
});

export default TagsRouter;
