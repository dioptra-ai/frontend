import {Strategy as LocalStrategy} from 'passport-local';
import User from '../models/user.model.mjs';


const customFields = {
    usernameField: 'username',
    passwordField: 'password'
};

const verifyCallback = async (username, password, done) => {
    try {
        const user = await User.findOne({username});

        if (!user) {
            return done('wrong_credentials');
        }

        const validPassword = await user.validPassword(password);

        if (!validPassword) {
            return done('wrong_credentials');
        }

        return done(null, user);
    } catch (error) {
        return done('bad_request');

    }
};

const userAuth = (passport) => {
    const strategy = new LocalStrategy(customFields, verifyCallback);

    passport.use(strategy);
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);

            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

export {userAuth};

