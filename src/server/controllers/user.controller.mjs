import {isAuthenticated} from '../middleware/authentication.mjs';
import express from 'express';
const UserRouter = express.Router();

// eslint-disable-next-line no-unused-vars
UserRouter.get('/', isAuthenticated, (req, res, next) => {
    res.send('USERS home page');
});

export default UserRouter;
