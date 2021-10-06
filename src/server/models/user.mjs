import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
        ref: 'OrganizationMembership'
    }
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});

userSchema.virtual('organizationMemberships', {
    ref: 'OrganizationMembership',
    localField: '_id',
    foreignField: 'user'
});

userSchema.statics.initializeCollection = async () => {

    if (!await User.exists()) {
        const Organization = mongoose.model('Organization');

        await User.createAsMemberOf({
            username: 'admin', password: 'admin'
        }, await new Organization(
            {
                name: 'Demo Organization',
                ...process.env.DEMO_ORG_ID && {_id: process.env.DEMO_ORG_ID}
            }
        ).save());

        console.log('Admin User Created');
    }
};

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
    const newUser = await User.create(userProps);
    const newOrgMembership = await OrganizationMembership.create({
        user: newUser._id,
        organization: organization._id
    });

    newUser.activeOrganizationMembership = newOrgMembership;

    return newUser.save();
};

const User = mongoose.model('User', userSchema);

export default User;
