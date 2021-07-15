import express from 'express';
const ApiRouter = express.Router();

import UserRouter from './controllers/user.controller.mjs';
import AuthRouter from './controllers/auth.controller.mjs';

ApiRouter.use('/user', UserRouter);
ApiRouter.use('/auth', AuthRouter);

export default ApiRouter;
