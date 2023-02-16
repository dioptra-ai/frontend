import express from 'express';
import mongoose from 'mongoose';
import {isAuthenticated} from '../middleware/authentication.mjs';

const MlModelRouter = express.Router();

MlModelRouter.all('*', isAuthenticated);

MlModelRouter.get('/:_id', async (req, res, next) => {
    try {
        const MlModel = mongoose.model('MlModel');

        res.json(
            await MlModel.findOne({
                _id: req.params._id,
                organization: req.user.requestOrganization
            })
        );
    } catch (e) {
        next(e);
    }
});

MlModelRouter.get('/', async (req, res, next) => {
    try {
        await req.user.requestOrganization.populate('mlModels');

        res.json(req.user.requestOrganization.mlModels);
    } catch (e) {
        next(e);
    }
});

MlModelRouter.post('/', async (req, res, next) => {
    try {
        const MlModel = mongoose.model('MlModel');

        const modelData = await MlModel.create({
            ...req.body,
            organization: req.user.requestOrganizationId
        });

        res.json(modelData);
    } catch (e) {
        const {code} = e;

        if (code === 11000) {
            res.status(400);
            next(new Error('A model with this id already exists'));
        } else {
            next(e);
        }
    }
});

MlModelRouter.put('/:id', async (req, res, next) => {
    try {
        const MlModel = mongoose.model('MlModel');

        const modelData = await MlModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(modelData);
    } catch (e) {
        const {code} = e;

        if (code === 11000) {
            res.status(400);
            next(new Error('A model with this id already exists'));
        } else {
            next(e);
        }
    }
});

MlModelRouter.delete('/:id', async (req, res, next) => {
    try {
        const MlModel = mongoose.model('MlModel');

        await MlModel.findByIdAndDelete(req.params.id);

        res.sendStatus(204);
    } catch (e) {
        next(e);
    }
});

export default MlModelRouter;
