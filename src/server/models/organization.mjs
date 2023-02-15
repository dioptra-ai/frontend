import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const organizationSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        get (_id) { // eslint-disable-line func-names
            return _id.toHexString();
        }
    },
    name: {type: String, required: true}
}, {timestamps: true});

organizationSchema.virtual('organizationMemberships', {
    ref: 'OrganizationMembership',
    localField: '_id',
    foreignField: 'organization'
});

organizationSchema.virtual('mlModels', {
    ref: 'MlModel',
    localField: '_id',
    foreignField: 'organization'
});

organizationSchema.statics.createWithMember = async (orgProps, userId) => {
    const OrganizationMembership = mongoose.model('OrganizationMembership');
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    const org = await Organization.create(orgProps);
    const orgMembership = await OrganizationMembership.create({
        user: userId,
        organization: org._id
    });

    user.activeOrganizationMembership = orgMembership;

    await user.save();

    return org;
};

organizationSchema.statics.createAndInitialize = async (orgProps, firstUserProps) => {
    const User = mongoose.model('User');
    const org = await Organization.create(orgProps);

    await User.createAsMemberOf(firstUserProps, org);

    return org;
};

organizationSchema.statics.initializeCollection = async () => {

    if (!await Organization.exists()) {

        await Organization.createAndInitialize({
            name: 'Admin Organization'
        }, {
            username: 'admin@dioptra.ai', password: 'password'
        });

        console.log('Admin Organization Created');
    }
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
