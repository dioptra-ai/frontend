import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    name: String
}, {timestamps: true});

export default mongoose.model('Organization', organizationSchema);
