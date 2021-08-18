import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true, set (password) {
        // eslint-disable-next-line no-sync
        return bcrypt.hashSync(password, 10);
    }}
}, {timestamps: true});

userSchema.statics.initializeCollection = async () => {

    if (!await User.exists()) {
        await User.create({username: 'admin', password: 'admin'});
        await User.create({username: 'admin1', password: 'admin1'});

        console.log('Admin User Created');
    }
};

// Instance Methods
/**
 *
 * @param password
 * @returns promise
 */
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
