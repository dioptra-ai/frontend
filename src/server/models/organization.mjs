import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const organizationSchema = new Schema({
    name: String
}, {timestamps: true});

organizationSchema.virtual('organizationMemberships', {
    ref: 'OrganizationMembership',
    localField: '_id',
    foreignField: 'organization'
});

export default mongoose.model('Organization', organizationSchema);
