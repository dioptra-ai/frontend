import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const integrationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    type: {
        type: String,
        enum: ['REDASH', 'AWS_S3'],
        default: 'REDASH',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Integrations', integrationSchema);
