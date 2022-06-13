import mongoose from 'mongoose';

const precannedOrgId = process.env['PRECANNED_ORG_ID'];

if (!precannedOrgId) {
    console.error('No PRECANNED_ORG_ID in the environment - new orgs will be empty!');
}

const Schema = mongoose.Schema;
const organizationSchema = new Schema({
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

organizationSchema.pre('save', async function () {

    try {
        if (this.isNew && precannedOrgId) { // eslint-disable-line no-invalid-this
            const MlModel = mongoose.model('MlModel');
            const precannedMlModels = await MlModel.find({
                organization: precannedOrgId
            }).select('-_id').lean();

            return Promise.all(
                precannedMlModels.map((precannedMlModel) => MlModel.create({
                    ...precannedMlModel,
                    organization: this._id // eslint-disable-line no-invalid-this
                }))
            );
        } else return null;
    } catch (e) {
        console.error(e);

        return null;
    }
});

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
            username: 'admin', password: 'admin'
        });

        console.log('Admin Organization Created');
    }
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
