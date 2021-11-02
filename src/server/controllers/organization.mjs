import express from 'express';
import mongoose from 'mongoose';
import {isAdmin, isAuthenticated} from '../middleware/authentication.mjs';

const OrganizationRouter = express.Router();

OrganizationRouter.all('*', isAuthenticated);

OrganizationRouter.get('/members/:id', async (req, res, next) => {
    try {
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');

        const result = await OrganizationMembershipModel.find({
            organization: req.params.id
        }).populate('user');

        res.send(result);
    } catch (e) {
        next(e);
    }
});

OrganizationRouter.post('/members/:id', isAdmin, async (req, res, next) => {
    const {username, type} = req.body;
    const {id: organizationID} = req.params;

    try {
        const UserModel = mongoose.model('User');
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');

        const existingUser = await UserModel.findOne({username});

        const organizationMembershipDetails = await OrganizationMembershipModel.findOne({
            user: existingUser?._id
        });

        // No modification needed if member is already part of the same organisation
        if (
            organizationMembershipDetails &&
      organizationMembershipDetails.organization === organizationID
        ) {
            res.status(400).send('Member already exists in this organization!');
        } else if (existingUser) {
            let newOrganizationMemberDetails = null;

            if (organizationMembershipDetails) {
                newOrganizationMemberDetails =
          await OrganizationMembershipModel.findByIdAndUpdate(
              organizationMembershipDetails._id,
              {
                  organization: organizationID,
                  type
              }
          );
            } else {
                newOrganizationMemberDetails = await OrganizationMembershipModel.create({
                    organization: organizationID,
                    user: existingUser?._id,
                    type
                });
            }

            await UserModel.findByIdAndUpdate(existingUser._id, {
                activeOrganizationMembership: newOrganizationMemberDetails._id
            });

            res.sendStatus(200);
        } else {
            const newMember = await UserModel.create({username, password: 'password'});

            const newOrganizationMemberDetails = await OrganizationMembershipModel.create({
                organization: organizationID,
                user: newMember?._id,
                type
            });

            await UserModel.findByIdAndUpdate(newMember._id, {
                activeOrganizationMembership: newOrganizationMemberDetails._id
            });

            res.sendStatus(200);
        }
    } catch (e) {
        next(e);
    }
});

OrganizationRouter.post('/rename', isAdmin, async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const {name} = req.body;
        const OrganizationModel = mongoose.model('Organization');

        const result = await OrganizationModel.findByIdAndUpdate(activeOrganizationMembership.organization._id, {name}, {new: true});

        res.send(result);
    } catch (e) {
        next(e);
    }
});

export default OrganizationRouter;
