import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import autopopulate from 'mongoose-autopopulate';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required: true},
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
        throw new Error('Unauthenticated');
    }

    const valid = await bcrypt.compare(password, foundUser.password);

    if (!valid) {
        throw new Error('Unauthenticated');
    } else {

        return foundUser;
    }
};

userSchema.statics.createAsMemberOf = async (userProps, organization) => {
    const OrganizationMembership = mongoose.model('OrganizationMembership');
    const newUser = new User(userProps);

    const newOrgMembership = await OrganizationMembership.create({
        user: newUser._id,
        organization: organization._id
    });

    newUser.activeOrganizationMembership = newOrgMembership;

    return newUser.save();
};

const User = mongoose.model('User', userSchema);

export default User;
