import express from 'express';
import mongoose from 'mongoose';
import {isAdmin, isAuthenticated} from '../middleware/authentication.mjs';

const OrganizationRouter = express.Router();

OrganizationRouter.all('*', isAuthenticated);

OrganizationRouter.get('/', async (req, res, next) => {
    try {
        const OrganizationModel = mongoose.model('Organization');
        const result = await OrganizationModel.findById(req.user.activeOrganizationId);

        res.json(result);
    } catch (e) {
        next(e);
    }
});

OrganizationRouter.post('/', async (req, res, next) => {
    try {
        const OrganizationModel = mongoose.model('Organization');
        const newOrganization = await OrganizationModel.createWithMember(req.body, req.user._id);

        res.json(newOrganization);
    } catch (e) {
        next(e);
    }
});

OrganizationRouter.post('/rename', isAdmin, async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const {name} = req.body;
        const OrganizationModel = mongoose.model('Organization');

        const result = await OrganizationModel.findByIdAndUpdate(
            activeOrganizationMembership.organization._id,
            {name},
            {new: true}
        );

        res.json(result);
    } catch (e) {
        next(e);
    }
});

export default OrganizationRouter;
