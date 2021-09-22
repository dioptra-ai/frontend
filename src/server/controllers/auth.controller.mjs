import express from 'express';
import passport from 'passport';

const AuthRouter = express.Router();

AuthRouter.post('/login', (req, res, next) => {

    if (req.user) {

        res.json(req.user);
    } else {

        passport.authenticate('local', (error, user) => {

            if (error) {

                res.status(401);
                next(error);
            } else if (!user) {

                res.status(401);
                next(new Error('Unauthorized'));
            } else {

                req.logIn(user, (error) => {

                    if (error) {
                        res.status(401);
                        next(new Error('Unauthorized'));
                    } else {
                        const safeUser = user.toObject();

                        delete safeUser.password;

                        res.json(safeUser);
                    }
                });
            }
        })(req, res, next);
    }
});

// eslint-disable-next-line no-unused-vars
AuthRouter.post('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

export default AuthRouter;
