import express from 'express';
import mongoose from 'mongoose';
import {isAuthenticated, isOrgAdmin} from '../middleware/authentication.mjs';

const OrganizationRouter = express.Router();

OrganizationRouter.all('*', isAuthenticated);

OrganizationRouter.get('/', async (req, res, next) => {
    try {
        const OrganizationModel = mongoose.model('Organization');
        const result = await OrganizationModel.findById(req.user.requestOrganizationId);

        res.json(result);
    } catch (e) {
        next(e);
    }
});

OrganizationRouter.get('/memberships', async (req, res, next) => {
    try {
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');

        const allMemberships = await OrganizationMembershipModel.find({
            organization: req.user.requestOrganizationId
        });

        res.send(allMemberships);
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

OrganizationRouter.post('/rename', isOrgAdmin, async (req, res, next) => {
    try {
        const {name} = req.body;
        const OrganizationModel = mongoose.model('Organization');

        const result = await OrganizationModel.findByIdAndUpdate(
            req.user.requestOrganizationId,
            {name},
            {new: true}
        );

        res.json(result);
    } catch (e) {
        next(e);
    }
});

OrganizationRouter.post('/memberships', isOrgAdmin, async (req, res, next) => {
    const {username, password, type} = req.body;
    const organizationID = req.user.requestOrganizationId;

    try {
        const UserModel = mongoose.model('User');
        const Organization = mongoose.model('Organization');
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');

        const existingUser = await UserModel.findOne({username});

        const organizationDetails = await Organization.findById(organizationID);

        const organizationMembershipDetails = await OrganizationMembershipModel.findOne({
            user: existingUser?._id,
            organization: organizationID
        });

        // No modification needed if member is already part of the same organisation
        if (organizationMembershipDetails) {
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
                newOrganizationMemberDetails =
                    await OrganizationMembershipModel.create({
                        organization: organizationID,
                        user: existingUser?._id,
                        type
                    });
            }

            await UserModel.findByIdAndUpdate(existingUser._id, {
                activeOrganizationMembership: newOrganizationMemberDetails._id
            });

            res.status(200).send(
                `${existingUser.username} is now a member of ${organizationDetails.name}`
            );
        } else {
            const newMember = await UserModel.createAsMemberOf(
                {
                    username,
                    password
                },
                organizationDetails
            );

            res.status(200).send(
                `A new user with username ${newMember.username} is now a member of ${organizationDetails.name}. Their password should be changed in their profile page.`
            );
        }
    } catch (e) {
        next(e);
    }
});

export default OrganizationRouter;
