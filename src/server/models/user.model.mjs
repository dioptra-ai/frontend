import mongoose from 'mongoose';

//TODO: add password hashing
const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}
}, {timestamps: true});

export default mongoose.model('User', userSchema);
