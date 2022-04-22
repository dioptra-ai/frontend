import express from 'express';
import mongoose from 'mongoose';
import {isAuthenticated} from '../middleware/authentication.mjs';

const MlModelRouter = express.Router();

MlModelRouter.all('*', isAuthenticated);

MlModelRouter.get('/search', async (req, res, next) => {
    try {
        const {queryString} = req.query;
        const MlModel = mongoose.model('MlModel');

        let query = {};

        if (queryString) {
            query = {
                $or: [
                    {name: {$regex: queryString, $options: 'i'}},
                    {description: {$regex: queryString, $options: 'i'}},
                    {mlModelId: {$regex: queryString, $options: 'i'}},
                    {mlModelType: {$regex: queryString, $options: 'i'}}
                ]
            };
        }

        res.json(await MlModel.find(query));
    } catch (e) {
        next(e);
    }
});

MlModelRouter.get('/:_id', async (req, res, next) => {
    try {
        const MlModel = mongoose.model('MlModel');

        res.json(
            await MlModel.findOne({
                _id: req.params._id,
                organization: req.user.activeOrganizationMembership.organization
            })
        );
    } catch (e) {
        next(e);
    }
});

MlModelRouter.get('/', async (req, res, next) => {
    try {
        await req.user.activeOrganizationMembership.organization.populate('mlModels');

        res.json(req.user.activeOrganizationMembership.organization.mlModels);
    } catch (e) {
        next(e);
    }
});

MlModelRouter.post('/', async (req, res, next) => {
    try {
        const MlModel = mongoose.model('MlModel');

        const modelData = await MlModel.create({
            ...req.body,
            organization: req.user.activeOrganizationMembership.organization._id
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

export default MlModelRouter;
