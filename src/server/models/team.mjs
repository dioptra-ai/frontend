import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: String
}, {timestamps: true});

export default mongoose.model('Team', teamSchema);
