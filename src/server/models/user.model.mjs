import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}
}, {timestamps: true});


// Static Methods
/**
 *
 * @param password
 * @returns promise
 */
userSchema.statics.generateHash = function (password) {
    return bcrypt.hash(password, 10);
};

// Instance Methods
/**
 *
 * @param password
 * @returns promise
 */
userSchema.methods.validPassword = function (password) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
