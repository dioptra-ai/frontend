import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

import {manageTransaction} from '../utils.mjs';

const Schema = mongoose.Schema;
const organizationMembershipSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        autopopulate: true
    },
    type: { // i think this needs typePojoToMixed: false
        type: String,
        enum: ['ADMIN', 'MEMBER'],
        default: 'ADMIN',
        required: true
    }
}, {
    timestamps: true,
    typePojoToMixed: false
});

organizationMembershipSchema.plugin(autopopulate);

organizationMembershipSchema.index({user: 1, organization: 1}, {unique: 1});

organizationMembershipSchema.statics.setAsActiveMemberOf = ({user, organization, type}) => {

    return manageTransaction(async (session) => {
        const organizationMembership = await OrganizationMembership.findOneAndUpdate({
            user: user._id,
            organization: organization._id
        }, {
            user: user._id,
            organization: organization._id,
            type
        }, {upsert: true, returnDocument: 'after', session});
        const UserModel = mongoose.model('User');

        await UserModel.findByIdAndUpdate(user._id, {
            activeOrganizationMembership: organizationMembership._id
        }, {session});
    });
};

organizationMembershipSchema.statics.removeAndResetActiveMembership = (organizationMembershipID) => {

    return manageTransaction(async (session) => {
        const UserModel = mongoose.model('User');
        const {user, organization} = await OrganizationMembership.findById(organizationMembershipID);
        const allOtherOrgsOfUser = await OrganizationMembership.find({
            user,
            organization: {$nin: organization}
        });

        if (allOtherOrgsOfUser.length === 0) {

            throw new Error('Operation not permitted. This organization is the only one the user is a member of.');
        }

        await OrganizationMembership.findByIdAndDelete(organizationMembershipID, {session});

        await UserModel.findByIdAndUpdate(user, {
            activeOrganizationMembership: allOtherOrgsOfUser[0]?._id
        }, {session});
    });
};

const OrganizationMembership = mongoose.model('OrganizationMembership', organizationMembershipSchema);

export default OrganizationMembership;

OrganizationMembership.on('index', (err) => {
    if (err) {
        console.error(`Error while building OrganizationMembership index: ${err}`);
    }
});
