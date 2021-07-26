import mongoose from 'mongoose';

const mlModelSchema = new mongoose.Schema({
    mlModelId: {
        type: String,
        unique: true // Change this uniqueness when doing multitenancy.
    },
    name: String,
    teamId: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
    description: String,
    mlModelVersion: String,
    lastDeployed: Date,
    mlModelTier: Number,
    mlModelType: {
        type: String,
        enum: ['IMAGE_CLASSIFIER'],
        required: true
    }
}, {timestamps: true});

mlModelSchema.statics.initializeCollection = async () => {

    if (!await MlModel.exists()) {
        await MlModel.create({
            mlModelId: 1,
            name: 'Document Classifier',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
            lastDeployed: new Date('2021-07-14T01:20:51.873Z'),
            mlModelTier: 5,
            mlModelVersion: 'V 1.01',
            mlModelType: 'IMAGE_CLASSIFIER'
        });

        console.log('Credit Card Fraud model created.');
    }
};

const MlModel = mongoose.model('MlModel', mlModelSchema);

export default MlModel;
