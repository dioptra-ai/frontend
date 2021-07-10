import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true, set (password) {
        // eslint-disable-next-line no-sync
        return bcrypt.hashSync(password, 10);
    }}
}, {timestamps: true});

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
