import fetch from 'node-fetch';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import autopopulate from 'mongoose-autopopulate';

import {manageTransaction} from '../utils.mjs';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {
        type: String,
        required: true,
        select: false, // Users.find().select('+password') to override
        set (password) {
            // eslint-disable-next-line no-sync
            return bcrypt.hashSync(password, 10);
        }
    },
    activeOrganizationMembership: {
        type: Schema.Types.ObjectId,
        ref: 'OrganizationMembership',
        required: true,
        autopopulate: true // This makes a loop with organizationMembershipSchema.user - use {select: '-user'} and fix all issues arising
    },
    cart: {
        type: [String],
        set (cart) {
            return Array.from(new Set(cart));
        }
    }
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});

userSchema.plugin(autopopulate);

userSchema.virtual('organizationMemberships', {
    ref: 'OrganizationMembership',
    localField: '_id',
    foreignField: 'user'
});

userSchema.statics.validatePassword = async (username, password) => {
    const foundUser = await User.findOne({username}).select('+password');

    if (!foundUser) {
        throw new Error('Incorrect username or password.');
    }

    const valid = await bcrypt.compare(password, foundUser.password);

    if (!valid) {
        throw new Error('Incorrect username or password.');
    } else {

        return foundUser;
    }
};

userSchema.statics.createWithinOrganization = (userProps, organization) => {

    return manageTransaction(async (session) => {
        const OrganizationMembership = mongoose.model('OrganizationMembership');
        const Organization = mongoose.model('Organization');
        const newUser = new User(userProps);

        console.log('/Users/jacques/dioptra/services/frontend/src/server/models/user.mjs:66', newUser);
        const [newUserHomeOrganization] = await Organization.create([{
            name: `Organization of ${newUser.username}`
        }], {session});

        // TODO: this isn't rolled-back when User.create fails because of invalid email...
        const [newUserHomeMembership] = await OrganizationMembership.create([{
            user: newUser._id,
            organization: newUserHomeOrganization._id
        }], {session});

        if (organization) {
            const [newUserMembership] = await OrganizationMembership.create([{
                user: newUser._id,
                organization: organization._id
            }], {session});


            newUser.activeOrganizationMembership = newUserMembership;
        } else {

            newUser.activeOrganizationMembership = newUserHomeMembership;
        }

        const [savedUser] = await User.create([newUser], {session});

        return savedUser;
    });
};

userSchema.pre('save', async function () {

    if (this.isNew || this.isModified('username')) { // eslint-disable-line no-invalid-this
        let status = 'valid';

        try {
            const response = await fetch(`https://api.hunter.io/v2/email-verifier?email=${this['username']}&api_key=29073794876a97a92ba2b8a1b45291305a2350af`); // eslint-disable-line no-invalid-this

            if (response.ok) {
                const jsonResponse = await response.json();

                status = jsonResponse['data']['status'];
            } else {
                throw new Error(`[Status ${response.status}] ${response.text()}`);
            }
        } catch (e) {
            console.warn(`API Error when verifying email address: ${e.message}`);
        }

        // see: https://hunter.io/api-documentation/v2#email-verifier
        // "valid": the email address is valid.
        // "invalid": the email address is not valid.
        // "accept_all": the email address is valid but any email address is accepted by the server.
        // "webmail": the email address comes from an email service provider such as Gmail or Outlook.
        // "disposable": the email address comes from a disposable email service provider.
        // "unknown": we failed to verify the email address.
        if (status === 'invalid' || status === 'disposable') {

            throw new Error(`We could not verify this email: ${this['username']}. Please use a valid work email.`); // eslint-disable-line no-invalid-this
        }
    }
});

const User = mongoose.model('User', userSchema);

export default User;

User.on('index', (err) => {
    if (err) {
        console.error(`Error while building User index: ${err}`);
    }
});
