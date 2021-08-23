import express from 'express';
import passport from 'passport';
const AuthRouter = express.Router();

AuthRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', (error, user) => {
        if (error) {
            return res.status(401).send({error});
        }

        if (!user) {
            return res.status(401).send({error: 'bad_request'});
        }

        return req.logIn(user, (error) => {
            if (error) {
                return res.status(401).send({error: 'bad_request'});
            }

            return res.send(user);
        });
    })(req, res, next);
});

// eslint-disable-next-line no-unused-vars
AuthRouter.post('/logout', (req, res, next) => {
    req.logout();
    res.send({err: 'logged out'});
});

export default AuthRouter;
