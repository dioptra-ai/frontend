import {isAuthenticated} from '../middleware/authentication.mjs';
import express from 'express';
import Mongoose from 'mongoose';

const UserModel = Mongoose.model('User');
const UserRouter = express.Router();

UserRouter.put('/', isAuthenticated, async (req, res, next) => {
    const {username} = req.body;
    const authUser = req.user;
    const existingUser = await UserModel.findOne({username});

    try {
        if (existingUser && !existingUser._id.equals(authUser._id)) {

            res.status(400);
            throw new Error('Username already taken.');
        } else {
            const resp = await UserModel.findByIdAndUpdate(
                authUser._id, {
                    ...req.body,
                    new: true
                }
            );

            res.json(resp);
        }
    } catch (e) {
        next(e);
    }
});

UserRouter.post('/', async (req, res, next) => {
    try {
        const {username, password} = req.body;

        if (await UserModel.exists({username})) {

            res.status(400);
            throw new Error('Username already taken.');
        } else {

            res.json(await UserModel.create({
                username, password
            }));
        }
    } catch (e) {
        next(e);
    }
});

export default UserRouter;
