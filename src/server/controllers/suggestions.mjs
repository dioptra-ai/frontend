import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Suggestion from '../models/suggestions.mjs';

const SuggestionsRouter = express.Router();

SuggestionsRouter.all('*', isAuthenticated);

SuggestionsRouter.post('/', async (req, res, next) => {
    try {
        const tags = await Suggestion.findByDatapointIds(req.user.activeOrganizationId, req.body.datapointIds);

        res.json(tags);
    } catch (e) {
        next(e);
    }
});

SuggestionsRouter.post('/get-keys-suggestions', async (req, res, next) => {
    try {
        const keys = await Suggestion.findKeySuggestions(req.body.key);

        res.json(keys);
    } catch (e) {
        next(e);
    }
});

SuggestionsRouter.post('/get-values-suggestions', async (req, res, next) => {
    try {
        const values = await Suggestion.findValueSuggestions(req.user.activeOrganizationId, req.body.key, req.body.value);

        res.json(values);
    } catch (e) {
        next(e);
    }
});
export default SuggestionsRouter;
