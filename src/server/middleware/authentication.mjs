import mongoose from 'mongoose';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import PassportStrategy from 'passport-strategy';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const sessionStore = new MongoStore({
    mongoUrl: process.env.DB_CONNECTION_URI,
    collectionName: 'sessions'
});

const sessionHandler = session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * Number(process.env.COOKIE_DURATION_HRS)
    }
});

const isAuthenticated = [
    passport.authenticate('optional-apikey'),
    (req, res, next) => {
        if (req.user) {
            next();
        } else {

            res.status(401);
            next(new Error('Not authenticated.'));
        }
    }
];

const isAdmin = (req, res, next) => {
    if (req.user && req?.user?.activeOrganizationMembership?.type === 'ADMIN') {
        next();
    } else {
        res.status(403);
        next(new Error('Not Authorized.'));
    }
};

passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser(async (_id, done) => {
    try {
        const User = mongoose.model('User');

        done(null, await User.findById(_id));
    } catch (error) {
        done(error, null);
    }
});

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        const User = mongoose.model('User');
        const user = await User.validatePassword(username, password);

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

class OptionalApiKeyStrategy extends PassportStrategy {
    name = 'optional-apikey'

    async authenticate(req) {
        if (req.user) {
            this.pass();
        } else {
            const awsApiKey = req.headers['x-api-key'];

            if (!awsApiKey) {
                this.pass();
            } else {
                try {
                    const apiKey = await mongoose.model('ApiKey').findOne({awsApiKey}).populate('user');

                    if (apiKey) {
                        this.success(apiKey.user);
                    } else {
                        this.fail();
                    }
                } catch (e) {
                    this.error(e);
                }
            }
        }
    }
}

passport.use(new OptionalApiKeyStrategy());


export {isAuthenticated, sessionHandler, isAdmin};
