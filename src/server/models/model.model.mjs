import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    display: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    offlineClassDistribution: {
        _id: false,
        fraudulent: {
            type: Number
        },
        nonFraudulent: {
            type: Number
        },
        humanReview: {
            type: Number
        }
    }
}, {timestamps: true});

const Model = mongoose.model('Model', modelSchema);

export {Model};
