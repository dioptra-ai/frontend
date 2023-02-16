import express from 'express';
import mongoose from 'mongoose';
import {isAuthenticated, isOrgAdmin} from '../middleware/authentication.mjs';

const OrganizationMembershipRouter = express.Router();

OrganizationMembershipRouter.all('*', isAuthenticated);

OrganizationMembershipRouter.delete('/:organizationMembershipID', isOrgAdmin,
    async (req, res, next) => {
        try {
            const {organizationMembershipID} = req.params;
            const UserModel = mongoose.model('User');
            const OrganizationMembershipModel = mongoose.model('OrganizationMembership');
            const {user} = await OrganizationMembershipModel.findOne({
                _id: organizationMembershipID,
                organization: req.user.requestOrganizationId
            });

            if (req.user._id === user?._id) {

                throw new Error('Operation not permitted. Please contact an admin of your organization.');
            }

            await OrganizationMembershipModel.findByIdAndDelete(organizationMembershipID);

            const allMemberships = await OrganizationMembershipModel.find({user});

            await UserModel.findByIdAndUpdate(user, {
                activeOrganizationMembership: allMemberships[0]?._id
            });

            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    });

OrganizationMembershipRouter.put('/:organizationMembershipID/member', isOrgAdmin,
    async (req, res, next) => {
        try {
            const {type} = req.body;
            const {organizationMembershipID} = req.params;
            const OrganizationMembershipModel = mongoose.model('OrganizationMembership');
            const {user, organization} = await OrganizationMembershipModel.findById(
                organizationMembershipID
            );

            if (user._id === req.user._id) {

                throw new Error('Operation not permitted. Please contact an admin of your organization.');
            }

            const allOtherAdminsOfOrg = await OrganizationMembershipModel.find({
                organization,
                type: 'ADMIN',
                user: {$nin: user}
            });

            if (type === 'MEMBER' && allOtherAdminsOfOrg.length < 1) {
                throw new Error('Operation not permitted. There must be at least one admin.');
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
    });

export default OrganizationMembershipRouter;
