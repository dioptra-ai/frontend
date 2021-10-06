import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const organizationMembershipSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    organization: {type: Schema.Types.ObjectId, ref: 'Organization', required: true},
    type: { // i think this needs typePojoToMixed: false
        type: String,
        enum: ['ADMIN', 'MEMBER'],
        default: 'ADMIN',
        required: true
    }
}, {timestamps: true, typePojoToMixed: false});

export default mongoose.model('OrganizationMembership', organizationMembershipSchema);
