import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const Schema = mongoose.Schema;
const organizationMembershipSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: true
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        autopopulate: true
    },
    type: { // i think this needs typePojoToMixed: false
        type: String,
        enum: ['ADMIN', 'MEMBER'],
        default: 'ADMIN',
        required: true
    }
}, {
    timestamps: true,
    typePojoToMixed: false
});

organizationMembershipSchema.plugin(autopopulate);

export default mongoose.model('OrganizationMembership', organizationMembershipSchema);
