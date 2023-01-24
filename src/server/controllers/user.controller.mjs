import express from 'express';
import mongoose from 'mongoose';
import {body} from 'express-validator';
import {isAuthenticated} from '../middleware/authentication.mjs';
import validate from '../middleware/validate.mjs';


const UserRouter = express.Router();

UserRouter.put('/', isAuthenticated, async (req, res, next) => {
    const UserModel = mongoose.model('User');
    const {username, password, cart} = req.body;
    const authUser = req.user;

    try {
        if (username) {
            const existingUser = await UserModel.findOne({username});

            if (existingUser && existingUser._id !== authUser._id) {
                res.status(400);
                throw new Error('Username already taken.');
            } else {
                authUser.username = username;
            }
        }

        if (password) {
            authUser.password = password;
        }
        if (cart) {
            authUser.cart = cart;
        }

        res.json(await authUser.save());
    } catch (e) {
        next(e);
    }
});

UserRouter.post('/',
    body('username').isEmail(),
    body('password').isLength({min: 5}),
    validate,
    async (req, res, next) => {
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

UserRouter.get('/my-memberships', isAuthenticated, async (req, res, next) => {
    try {
        const OrganizationMembershipModel = mongoose.model('OrganizationMembership');

        const result = await OrganizationMembershipModel.find({
            user: req.user._id
        }).populate('organization');

        res.send(result);
    } catch (e) {
        next(e);
    }
});

UserRouter.put('/change-membership', isAuthenticated, async (req, res, next) => {
    try {
        const {organizationMembershipID} = req.body;
        const UserModel = mongoose.model('User');

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id,
            {
                activeOrganizationMembership: organizationMembershipID
            },
            {new: true}
        ).populate({
            path: 'activeOrganizationMembership',
            populate: {
                path: 'organization'
            }
        });

        res.send(updatedUser);
    } catch (e) {
        next(e);
    }
});

export default UserRouter;
