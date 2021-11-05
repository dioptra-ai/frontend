import {Strategy as LocalStrategy} from 'passport-local';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import User from '../models/user.mjs';

const customFields = {
    usernameField: 'username',
    passwordField: 'password'
};

const verifyCallback = async (username, password, done) => {
    try {
        const user = await User.validatePassword(username, password);

        return done(null, user);
    } catch (error) {
        return done(error);
    }
};

const userAuth = (passport) => {
    const strategy = new LocalStrategy(customFields, verifyCallback);

    passport.use(strategy);
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (_id, done) => {
        try {
            const user = await User.findOne({_id}).populate({
                path: 'activeOrganizationMembership',
                populate: {
                    path: 'organization'
                }
            });

            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

const sessionStore = new MongoStore({
    mongoUrl: process.env.DB_CONNECTION_URI,
    collectionName: 'sessions'
});

const sessionHandler = session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * Number(process.env.COOKIE_DURATION_HRS)
    }
});

const isAuthenticated = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401);
        next(new Error('Not authenticated.'));
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req?.user?.activeOrganizationMembership?.type === 'ADMIN') {
        next();
    } else {
        res.status(403);
        next(new Error('Not Authorized.'));
    }
};

export {isAuthenticated, sessionHandler, userAuth, isAdmin};
