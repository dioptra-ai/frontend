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
            'IMAGE_CLASSIFIER',
            'TABULAR_CLASSIFIER',
            'DOCUMENT_PROCESSING',
            'Q_N_A',
            'TEXT_CLASSIFIER'
        ],
        required: true
    },
    benchmarkSet: Boolean,
    referencePeriod: {
        start: Date,
        end: Date
    },
    // benchmarkPeriodDataset: {
    //     referencePeriod: {
    //         start: Date,
    //         end: Date
    //     },
    benchmarkModel: String,
    // const mlModel = useModel()
    // use populate to replace the mlModelId with the actual model
    // @see: https://mongoosejs.com/docs/populate.html
    // mlModel.benchmarkPeriodDataset.model.mlModelId
    // mlModel.benchmarkPeriodDataset.model.mlModelVersion
    // mlModel.benchmarkPeriodDataset.model.organization
    //
    benchmarkMlModelVersion: String
    // }
}, {timestamps: true});

const MlModel = mongoose.model('MlModel', mlModelSchema);

export default MlModel;
