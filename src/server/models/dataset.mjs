import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const datasetSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    datasetId: {
        type: String,
        default() {

            return this._id;
        }
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
