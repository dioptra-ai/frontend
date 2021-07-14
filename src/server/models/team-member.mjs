import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    teamId: {type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true},
    type: { // i think this needs typePojoToMixed: false
        type: String,
        enum: ['ADMIN', 'MEMBER'],
        default: 'ADMIN',
        required: true
    }
}, {timestamps: true, typePojoToMixed: false});

export default mongoose.model('TeamMember', teamMemberSchema);
