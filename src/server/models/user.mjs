import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import autopopulate from 'mongoose-autopopulate';

const {OVERRIDE_POSTGRES_ORG_ID} = process.env;

const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        get(_id) { // eslint-disable-line func-names
            return _id.toHexString();
        }
    },
    username: {type: String, required: true},
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false, // Users.find().select('+password') to override
        set (password) {
            if (password.length < 8) {

                // Should not pass validation.
                // See https://github.com/Automattic/mongoose/issues/492
                return password;
            } else {
                // eslint-disable-next-line no-sync
                return bcrypt.hashSync(password, 10);
            }
        }
    },
    activeOrganizationMembership: {
        type: Schema.Types.ObjectId,
        ref: 'OrganizationMembership',
        required: true,
        autopopulate: {maxDepth: 2}
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

/* eslint-disable no-invalid-this */
userSchema.virtual('requestOrganizationId').get(function () {

    if (OVERRIDE_POSTGRES_ORG_ID) {
        console.log('WARNING: OVERRIDE_POSTGRES_ORG_ID is set.');
    }

    return OVERRIDE_POSTGRES_ORG_ID ||
        // This might be called before autopopulate has kicked in, so organization? is necessary.
        this.requestOrganizationMembership?.organization?._id;
});

userSchema.virtual('requestOrganization').get(function () {

    return this.requestOrganizationMembership?.organization;
});

userSchema.virtual('requestOrganizationMembership').get(function () {

    return this.apikeyOrganizationMembership || // Used by API key auth
        this.activeOrganizationMembership; // Used by cookie session auth
});

userSchema.virtual('apikeyOrganizationMembership').get(function () {

    return this._apikeyOrganizationMembership;
}).set(function (membership) {
    this._apikeyOrganizationMembership = membership;
});
/* eslint-enable no-invalid-this */

userSchema.statics.validatePassword = async (username, password) => {
    const foundUser = await User.findOne({username}).select('+password');

    if (!foundUser) {
        throw new Error('Incorrect username or password.');
    }

    const valid = await bcrypt.compare(password, foundUser.password);

    delete foundUser.password;

    if (!valid) {
        throw new Error('Incorrect username or password.');
    } else {

        return foundUser;
    }
};

userSchema.statics.createAsMemberOf = async (userProps, organization) => {
    const OrganizationMembership = mongoose.model('OrganizationMembership');
    const newUser = new User(userProps);
    const newMembership = new OrganizationMembership({
        user: newUser._id,
        organization: organization._id
    });

    newUser.activeOrganizationMembership = newMembership;

    await newUser.save();
    await newMembership.save();

    await mongoose.model('ApiKey').createApiKeyForUser(newUser, organization);

    return newUser;
};

const User = mongoose.model('User', userSchema);

export default User;
