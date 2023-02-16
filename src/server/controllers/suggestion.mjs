import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';
import Suggestions from '../models/suggestion.mjs';

const SuggestionsRouter = express.Router();

SuggestionsRouter.all('*', isAuthenticated);

SuggestionsRouter.post('/get-keys-suggestions', async (req, res, next) => {
    try {
        res.json(
            await Suggestions.findKeySuggestions(req.body.key)
        );
    } catch (e) {
        next(e);
    }
});

SuggestionsRouter.post('/get-values-suggestions', async (req, res, next) => {
    try {
        res.json(
            await Suggestions.findValueSuggestions(req.user.requestOrganizationId, req.body.key, req.body.value)
        );
    } catch (e) {
        next(e);
    }
});

export default SuggestionsRouter;
