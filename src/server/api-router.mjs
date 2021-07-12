import express from 'express';
const ApiRouter = express.Router();

import UserRouter from './controllers/user.controller.mjs';
import AuthRouter from './controllers/auth.controller.mjs';
import ModelRouter from './controllers/ml-model.controller.mjs';

ApiRouter.use('/users', UserRouter);
ApiRouter.use('/auth', AuthRouter);
ApiRouter.use('/model', ModelRouter);

export default ApiRouter;
