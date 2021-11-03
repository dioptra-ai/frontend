import express from 'express';
import mongoose from 'mongoose';
import {isAdmin, isAuthenticated} from '../middleware/authentication.mjs';

const OrganizationRouter = express.Router();

OrganizationRouter.all('*', isAuthenticated);

OrganizationRouter.get('/:id/members', async (req, res, next) => {
    try {
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');

        const result = await OrganizationMembershipModel.find({
            organization: req.params.id,
            user: {$nin: [req.user._id]}
        }).populate('user');

        res.send(result);
    } catch (e) {
        next(e);
    }
});

OrganizationRouter.post('/:id/members', isAdmin, async (req, res, next) => {
    const {username, type} = req.body;
    const {id: organizationID} = req.params;

    try {
        const UserModel = mongoose.model('User');
        const Organization = mongoose.model('Organization');
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');

        const existingUser = await UserModel.findOne({username});

        const organizationMembershipDetails = await OrganizationMembershipModel.findOne({
            user: existingUser?._id
        });

        const organisationDetails = await Organization.findById(organizationID);

        // No modification needed if member is already part of the same organisation
        if (
            organizationMembershipDetails &&
      organizationMembershipDetails.organization.equals(organizationID)
        ) {
            throw new Error('Member already exists in this organization!');
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

            res
                .status(200)
                .send(
                    `${existingUser.username} is now a member of ${organisationDetails.name}`
                );
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

            res
                .status(200)
                .send(
                    `A new user with username ${newMember.username} is now a member of ${organisationDetails.name}. Their password has been set to password and should be changed in their profile page.`
                );
        }
    } catch (e) {
        next(e);
    }
});

OrganizationRouter.delete('/member', isAdmin, async (req, res, next) => {
    try {
        const {organizationMembershipID, user} = req.body;
        const UserModel = mongoose.model('User');
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');

        await OrganizationMembershipModel.findByIdAndDelete(organizationMembershipID);

        await UserModel.findByIdAndUpdate(user, {
            activeOrganizationMembership: undefined
        });

        res.sendStatus(204);
    } catch (e) {
        next(e);
    }
});

OrganizationRouter.put('/member', isAdmin, async (req, res, next) => {
    try {
        const {organizationMembershipID, type} = req.body;
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');

        await OrganizationMembershipModel.findByIdAndUpdate(organizationMembershipID, {
            type
        });

        res.sendStatus(201);
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

        res.send(result);
    } catch (e) {
        next(e);
    }
});

export default OrganizationRouter;
