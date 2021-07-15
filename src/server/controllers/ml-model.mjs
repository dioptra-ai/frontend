import express from 'express';
import mongoose from 'mongoose';

const MlModelRouter = express.Router();

MlModelRouter.get('/:_id', async (req, res, next) => {

    try {
        const MlModel = mongoose.model('MlModel');

        res.json(await MlModel.findById(req.params._id));
    } catch (e) {
        next(e);
    }
});

MlModelRouter.get('/', async (req, res, next) => {

    try {
        const MlModel = mongoose.model('MlModel');

        res.json(await MlModel.find());
    } catch (e) {
        next(e);
    }
});

export default MlModelRouter;
