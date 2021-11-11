import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const integrationSchema = new Schema({
    apiKey: {
        type: String,
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Integrations', integrationSchema);
