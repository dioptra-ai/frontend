import express from 'express';
import mongoose from 'mongoose';
import {body} from 'express-validator';
import {SESv2Client, SendEmailCommand} from '@aws-sdk/client-sesv2';
import jwt from 'jsonwebtoken';
import {expressjwt} from 'express-jwt';

import {isAuthenticated} from '../middleware/authentication.mjs';
import validate from '../middleware/validate.mjs';

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || 'supersecretkey';
const JWT_ALGORITHM = 'HS256';
const sesClient = new SESv2Client({region: 'us-east-2'});

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
    expressjwt({secret: JWT_PRIVATE_KEY, algorithms: [JWT_ALGORITHM]}),
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

UserRouter.post('/registration-token', async (req, res, next) => {
    try {
        const token = jwt.sign({
            username: req.body.username
        }, JWT_PRIVATE_KEY, {
            expiresIn: '1h',
            audience: 'dioptra.ai',
            issuer: 'dioptra.ai',
            subject: 'registration',
            algorithm: JWT_ALGORITHM
        });

        console.log(req.get('origin'));
        console.log(req.body.username);

        await sesClient.send(new SendEmailCommand({
            FromEmailAddress: 'hello@dioptra.ai',
            Destination: {
                ToAddresses: [req.body.username]
            },
            Content: {
                Simple: {
                    Subject: {
                        Data: 'Dioptra.ai Registration'
                    },
                    Body: {
                        Html: {
                            Data: `
                                <h1>Hello from Dioptra!</h1>
                                <p>Click <a href="${req.get('origin')}/register?token=${token}">here</a> to register (this link will expire in 1 hour).</p>
                            `,
                            Charset: 'UTF-8'
                        }
                    }
                }
            }
        }));

        res.end();
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

UserRouter.put('/active-membership', isAuthenticated, async (req, res, next) => {
    try {
        const {organizationMembershipID} = req.body;
        const membership = await mongoose.model('OrganizationMembership').findOne({
            _id: organizationMembershipID,
            user: req.user._id
        });

        if (!membership) {
            res.status(400);
            throw new Error('Invalid membership ID');
        } else {
            const updatedUser = await mongoose.model('User').findByIdAndUpdate(
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
        }
    } catch (e) {
        next(e);
    }
});

export default UserRouter;
