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

export const sessionHandler = session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * Number(process.env.COOKIE_DURATION_HRS)
    }
});

export const isAuthenticated = [
    passport.authenticate('internal-port'),
    passport.authenticate('aws-apikey'),
    (req, res, next) => {
        if (req.user) {
            next();
        } else {

            res.sendStatus(401);
        }
    }
];

export const isOrgAdmin = async (req, res, next) => {
    try {
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');
        const membership = await OrganizationMembershipModel.findOne({
            user: req.user._id,
            organization: req.user.requestOrganizationId
        });

        if (membership && membership.type === 'ADMIN') {
            next();
        } else {
            res.sendStatus(403);
        }
    } catch (e) {
        next(e);
    }
};

passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser(async (_id, done) => {
    try {
        const User = mongoose.model('User');
        const user = await User.findById(_id);

        done(null, user);
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

class InternalPortStrategy extends PassportStrategy {
    name = 'internal-port';

    authenticate(req) {
        if (req.socket.localPort === Number(process.env.INTERNAL_PORT)) {
            this.success({
                _id: 'internal',
                requestOrganizationId: req.headers['x-organization-id']
            });
        } else {
            this.pass();
        }
    }
}

class AWSApiKeyStrategy extends PassportStrategy {
    name = 'aws-apikey';

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
                        const apikeyMembership = await mongoose.model('OrganizationMembership').findOne({
                            user: apiKey.user,
                            organization: apiKey.organization
                        });

                        if (apikeyMembership) {
                            apiKey.user.apikeyOrganizationMembership = apikeyMembership;
                            this.success(apiKey.user);
                        } else {
                            this.error(new Error('Could not find an organization membership for the API key'));
                        }
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

passport.use(new InternalPortStrategy());
passport.use(new AWSApiKeyStrategy());
