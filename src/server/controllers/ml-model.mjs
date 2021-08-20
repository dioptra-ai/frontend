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
        const modelExists = await MlModel.findOne({mlModelId: req.body.mlModelId});

        console.log(res.body);

        if (modelExists) {
            res.status(400).send({err: {mlModelId: 'Model with ID Already Exists'}});
        } else {
            const modelData = await MlModel.create(req.body);

            res.send(modelData);
        }

    } catch (e) {
        next(e);
    }
});

export default MlModelRouter;
