import {isAuthenticated} from '../middleware/authentication.mjs';
import express from 'express';
import mongoose from 'mongoose';

const UserRouter = express.Router();

UserRouter.put('/', isAuthenticated, async (req, res, next) => {
    const UserModel = mongoose.model('User');
    const {username, password} = req.body;
    const authUser = req.user;
    const existingUser = await UserModel.findOne({username});

    try {
        if (existingUser && !existingUser._id.equals(authUser._id)) {
            res.status(400);
            throw new Error('Username already taken.');
        } else {
            const resp = await UserModel.findByIdAndUpdate(
                authUser._id,
                {
                    username,
                    password
                },
                {new: true}
            );

            res.json(resp);
        }
    } catch (e) {
        next(e);
    }
});

UserRouter.post('/', async (req, res, next) => {
    try {
        const UserModel = mongoose.model('User');
        const {username, password} = req.body;

        if (await UserModel.exists({username})) {
            res.status(400);
            throw new Error('Username already taken.');
        } else {
            const Organization = mongoose.model('Organization');

            res.json(
                await UserModel.createAsMemberOf(
                    {
                        username,
                        password
                    },
                    await new Organization({name: `Organization of ${username}`}).save()
                )
            );
        }
    } catch (e) {
        next(e);
    }
});

export default UserRouter;
