import express from 'express';
import mongoose from 'mongoose';
import {isAuthenticated} from '../middleware/authentication.mjs';

const KeyRouter = express.Router();

KeyRouter.all('*', isAuthenticated);

KeyRouter.get('/:_id', async (req, res, next) => {

    try {
        const Key = mongoose.model('Key');

        res.json(await Key.findOne({
            _id: req.params._id,
            user: req.user._id
        }));
    } catch (e) {
        next(e);
    }
});

export default KeyRouter;
