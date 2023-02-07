import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Tag from '../models/suggestions.mjs';

const TagsRouter = express.Router();

TagsRouter.all('*', isAuthenticated);

TagsRouter.post('/', async (req, res, next) => {
    try {
        const tags = await Tag.findByDatapointIds(req.user.activeOrganizationId, req.body.datapointIds);

        res.json(tags);
    } catch (e) {
        next(e);
    }
});

TagsRouter.post('/get-keys-suggestions', async (req, res, next) => {
    try {
        const keys = await Tag.findKeySuggestions(req.body.key);

        res.json(keys);
    } catch (e) {
        next(e);
    }
});

TagsRouter.post('/get-values-suggestions', async (req, res, next) => {
    try {
        const values = await Tag.findValueSuggestions(req.user.activeOrganizationId, req.body.key, req.body.value);

        res.json(values);
    } catch (e) {
        next(e);
    }
});
export default TagsRouter;
