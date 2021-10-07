import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const keySchema = new Schema({
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
    awsApiKey: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Organization', keySchema);
