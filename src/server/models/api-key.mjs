import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ApiKeySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    awsApiKeyId: {
        type: String,
        required: true
    },
    awsApiKey: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('ApiKey', ApiKeySchema);
