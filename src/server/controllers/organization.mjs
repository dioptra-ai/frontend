import express from 'express';
import mongoose from 'mongoose';
import {isAdmin, isAuthenticated} from '../middleware/authentication.mjs';

const OrganizationRouter = express.Router();

OrganizationRouter.all('*', isAuthenticated);

OrganizationRouter.post('/rename', isAdmin, async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const OrganizationModel = mongoose.model('Organization');

        const result = await OrganizationModel.findByIdAndUpdate(activeOrganizationMembership.organization._id, req.body, {new: true});

        res.send(result);
    } catch (e) {
        next(e);
    }
    next();
});

export default OrganizationRouter;
