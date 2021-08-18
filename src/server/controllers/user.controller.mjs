import {isAuthenticated} from '../middleware/authentication.mjs';
import express from 'express';
import Mongoose from 'mongoose';
const UserRouter = express.Router();

// eslint-disable-next-line no-unused-vars
UserRouter.get('/', isAuthenticated, (req, res, next) => {
    res.send('User data');
});

UserRouter.put('/', isAuthenticated, async (req, res, next) => {
    const {username} = req.body;
    const authUser = req.user;

    try {
        const UserModel = Mongoose.model('User');
        const existingUser = await UserModel.findOne({username});

        if (existingUser?._id && !existingUser._id.equals(authUser._id)) {
            res.status(400).send({err: 'Username already taken'});
        } else {
            const resp = await UserModel.findByIdAndUpdate(
                authUser._id,
                {...req.body},
                {new: true}
            );

            res.send(resp);
        }
    } catch (e) {
        next(e);
    }
});

export default UserRouter;
