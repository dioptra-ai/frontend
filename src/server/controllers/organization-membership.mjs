import express from 'express';
import mongoose from 'mongoose';
import {isAdmin, isAuthenticated} from '../middleware/authentication.mjs';

const OrganizationMembershipRouter = express.Router();

OrganizationMembershipRouter.all('*', isAuthenticated);

OrganizationMembershipRouter.get(
    '/:organizationID/members',
    async (req, res, next) => {
        try {
            const OrganizationMembership = mongoose.model('OrganizationMembership');
            const allMemberships = await OrganizationMembership.find({
                organization: req.params.organizationID
            });

            res.send(allMemberships);
        } catch (e) {
            next(e);
        }
    }
);

OrganizationMembershipRouter.post(
    '/:organizationID/members',
    isAdmin,
    async (req, res, next) => {
        const {username, password, type} = req.body;
        const {organizationID} = req.params;

        try {
            const UserModel = mongoose.model('User');
            const Organization = mongoose.model('Organization');
            const user = await UserModel.findOne({username});
            const organization = await Organization.findById(organizationID);

            if (user) {
                const OrganizationMembership = mongoose.model('OrganizationMembership');

                await OrganizationMembership.setAsActiveMemberOf({user, organization, type});

                res.send(`${user.username} is now a member of ${organization.name}.`);
            } else {
                const newMember = await UserModel.createWithinOrganization({
                    username, password
                },
                organization);

                res.send(`A new user with username ${newMember.username} is now a member of ${organization.name}. Their password has been set to "${password}" and should be changed in their profile page.`);
            }
        } catch (e) {
            next(e);
        }
    }
);

OrganizationMembershipRouter.delete('/:organizationMembershipID', isAdmin,
    async (req, res, next) => {
        try {
            const {organizationMembershipID} = req.params;
            const OrganizationMembership = mongoose.model('OrganizationMembership');

            await OrganizationMembership.removeAndResetActiveMembership(organizationMembershipID);

            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    });

OrganizationMembershipRouter.put('/:organizationMembershipID/member', isAdmin,
    async (req, res, next) => {
        try {
            const {type} = req.body;
            const {organizationMembershipID} = req.params;
            const OrganizationMembership = mongoose.model('OrganizationMembership');
            const {user, organization} = await OrganizationMembership.findById(
                organizationMembershipID
            );

            if (user._id.equals(req.user._id)) {

                throw new Error('Operation not permitted. Please contact an admin of your organization.');
            }

            const allOtherAdminsOfOrg = await OrganizationMembership.find({
                organization,
                type: 'ADMIN',
                user: {$nin: user}
            });

            if (type === 'MEMBER' && allOtherAdminsOfOrg.length < 1) {
                throw new Error('Operation not permitted. There must be at least one admin.');
            }

            await OrganizationMembership.findByIdAndUpdate(
                organizationMembershipID,
                {
                    type
                }
            );

            res.sendStatus(201);
        } catch (e) {
            next(e);
        }
    });

export default OrganizationMembershipRouter;
