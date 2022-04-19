import mongoose from 'mongoose';

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

organizationSchema.virtual('datasets', {
    ref: 'Dataset',
    localField: '_id',
    foreignField: 'organization'
});

organizationSchema.statics.createAndInitialize = async (orgProps, firstUserProps) => {
    const User = mongoose.model('User');
    const MlModel = mongoose.model('MlModel');
    const org = await Organization.create(orgProps);

    await Promise.all([
        User.createAsMemberOf(firstUserProps, org),
        MlModel.create([{
            mlModelId: 'document_classification',
            name: 'Document Classifier',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
            lastDeployed: new Date('2021-07-14T01:20:51.873Z'),
            mlModelTier: 5,
            mlModelType: 'IMAGE_CLASSIFIER',
            organization: org._id
        }, {
            mlModelId: 'credit_card_fraud_detection',
            name: 'Classifier',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
            lastDeployed: new Date('2021-07-14T01:20:51.873Z'),
            mlModelTier: 5,
            mlModelType: 'TABULAR_CLASSIFIER',
            organization: org._id
        }, {
            mlModelId: 'document_extraction',
            name: 'Document Extraction',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
            lastDeployed: new Date('2021-07-14T01:20:51.873Z'),
            mlModelTier: 5,
            mlModelType: 'DOCUMENT_PROCESSING',
            organization: org._id
        }])
    ]);

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
