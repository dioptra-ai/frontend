import mongoose from 'mongoose';

const mlModelSchema = new mongoose.Schema({
    mlModelId: {
        type: String,
        required: [true, 'Model ID is required'],
        validate: {
            async validator(mlModelId) {
                const existsForOrg = await MlModel.exists({
                    mlModelId,
                    organization: this.organization
                });

                return !existsForOrg;
            },
            message: ({value}) => `Model ID "${value}" already exists in this organization.`
        }
    },
    name: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    description: String,
    lastDeployed: Date,
    mlModelTier: Number,
    mlModelType: {
        type: String,
        enum: [
            'IMAGE_CLASSIFIER', // ok
            'TABULAR_CLASSIFIER', // TODO check working data
            'DOCUMENT_PROCESSING', // ok
            'Q_N_A', // ok
            'TEXT_CLASSIFIER', // ok
            'UNSUPERVISED_OBJECT_DETECTION', // TODO check working data
            'SPEECH_TO_TEXT', // ok
            'AUTO_COMPLETION' // WIP
        ],
        required: true
    },
    referencePeriod: {
        start: Date,
        end: Date
    },
    referenceBenchmarkId: String
}, {timestamps: true});

const MlModel = mongoose.model('MlModel', mlModelSchema);

export default MlModel;
