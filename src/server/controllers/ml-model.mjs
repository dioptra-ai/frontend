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

MlModelRouter.post('/', async (req, res, next) => {
    try {
        const MlModel = mongoose.model('MlModel');

        const modelData = await MlModel.create(req.body);

        res.send(modelData);

    } catch (e) {
        const {code, keyValue} = e;

        if (code === 11000) {
            res.status(400).json({err: {[`${Object.keys(keyValue)[0]}`]: 'Model with ID Already Exists.'}});
            next();
        } else {
            next(e);
        }
    }
});

export default MlModelRouter;
