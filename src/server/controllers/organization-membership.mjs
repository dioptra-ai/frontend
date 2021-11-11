import express from 'express';
import mongoose from 'mongoose';
import {isAdmin, isAuthenticated} from '../middleware/authentication.mjs';

const OrganizationMembershipRouter = express.Router();

OrganizationMembershipRouter.all('*', isAuthenticated);

OrganizationMembershipRouter.get(
    '/:organizationID/members',
    async (req, res, next) => {
        try {
            const OrganizationMembershipModel = mongoose.model(
                'OrganizationMembership'
            );

            const result = await OrganizationMembershipModel.find({
                organization: req.params.organizationID,
                user: {$nin: [req.user._id]}
            });

            res.send(
                result.filter(({_id, user}) => user.activeOrganizationMembership.equals(_id))
            );
        } catch (e) {
            next(e);
        }
    }
);

OrganizationMembershipRouter.post(
    '/:organizationID/members',
    isAdmin,
    async (req, res, next) => {
        const {username, type} = req.body;
        const {organizationID} = req.params;

        try {
            const UserModel = mongoose.model('User');
            const Organization = mongoose.model('Organization');
            const OrganizationMembershipModel = mongoose.model(
                'OrganizationMembership'
            );

            const existingUser = await UserModel.findOne({username});

            const organisationDetails = await Organization.findById(organizationID);

            const organizationMembershipDetails =
                await OrganizationMembershipModel.findOne({
                    user: existingUser?._id,
                    organization: organizationID
                });

            // No modification needed if member is already part of the same organisation
            if (
                organizationMembershipDetails &&
                existingUser?.activeOrganizationMembership?.equals(organizationID)
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
                    `${existingUser.username} is now a member of ${organisationDetails.name}`
                );
            } else {
                const newMember = await UserModel.createAsMemberOf(
                    {
                        username,
                        password: 'password'
                    },
                    organisationDetails
                );

                res.status(200).send(
                    `A new user with username ${newMember.username} is now a member of ${organisationDetails.name}. Their password has been set to password and should be changed in their profile page.`
                );
            }
        } catch (e) {
            next(e);
        }
    }
);

OrganizationMembershipRouter.delete(
    '/:organizationMembershipID',
    isAdmin,
    async (req, res, next) => {
        try {
            const {organizationMembershipID} = req.params;
            const UserModel = mongoose.model('User');
            const OrganizationMembershipModel = mongoose.model(
                'OrganizationMembership'
            );

            const {user, organization} = await OrganizationMembershipModel.findById(
                organizationMembershipID
            );

            const allAdminOfOrg = await OrganizationMembershipModel.find({
                organization,
                type: 'ADMIN',
                user: {$nin: user}
            });

            const allOrgsOfUser = await OrganizationMembershipModel.find({
                user,
                organization: {$nin: organization}
            });

            if (allAdminOfOrg.length > 0 && allOrgsOfUser.length > 0) {
                await OrganizationMembershipModel.findByIdAndDelete(
                    organizationMembershipID
                );

                await UserModel.findByIdAndUpdate(user, {
                    activeOrganizationMembership: allOrgsOfUser[0]?._id
                });

                res.sendStatus(204);
            } else {
                throw new Error('Operation not allowed for this user!');
            }
        } catch (e) {
            next(e);
        }
    }
);

OrganizationMembershipRouter.put(
    '/:organizationMembershipID/member',
    isAdmin,
    async (req, res, next) => {
        try {
            const {type} = req.body;
            const {organizationMembershipID} = req.params;

            const OrganizationMembershipModel = mongoose.model(
                'OrganizationMembership'
            );

            const {user, organization} = await OrganizationMembershipModel.findById(
                organizationMembershipID
            );

            const allAdminOfOrg = await OrganizationMembershipModel.find({
                organization,
                type: 'ADMIN',
                user: {$nin: user}
            });

            if (type === 'MEMBER' && allAdminOfOrg.length < 1) {
                throw new Error('Can not set last member of Organization as Member');
            }

            await OrganizationMembershipModel.findByIdAndUpdate(
                organizationMembershipID,
                {
                    type
                }
            );

            res.sendStatus(201);
        } catch (e) {
            next(e);
        }
    }
);

export default OrganizationMembershipRouter;
