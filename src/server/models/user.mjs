import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {
        type: String,
        required: true,
        select: false, // Users.find().select('+password') to override
        set (password) {
            // eslint-disable-next-line no-sync
            return bcrypt.hashSync(password, 10);
        }
    }
}, {timestamps: true});

userSchema.statics.initializeCollection = async () => {

    if (!await User.exists()) {
        await User.create({username: 'admin', password: 'admin'});

        console.log('Admin User Created');
    }
};

userSchema.statics.validatePassword = async (username, password) => {
    const foundUser = await User.findOne({username}).select('+password');

    if (!foundUser) {
        throw new Error('Unauthenticated');
    }

    const valid = await bcrypt.compare(password, foundUser.password);

    if (!valid) {
        throw new Error('Unauthenticated');
    } else {

        return foundUser;
    }
};

const User = mongoose.model('User', userSchema);

export default User;
