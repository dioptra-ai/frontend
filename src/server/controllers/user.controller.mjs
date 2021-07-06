import {auth} from '../config/sercurity-middleware.mjs';
import express from 'express';
const UserRouter = express.Router();

// eslint-disable-next-line no-unused-vars
UserRouter.get('/', auth, (req, res, next) => {
    res.send('USERS home page');
});

export default UserRouter;
