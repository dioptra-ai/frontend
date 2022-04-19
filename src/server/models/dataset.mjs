import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const datasetSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Dataset', datasetSchema);
