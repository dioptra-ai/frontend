import express from 'express';
const ApiRouter = express.Router();

import UserRouter from './controllers/user.controller.mjs';

ApiRouter.use('/users', UserRouter);

export default ApiRouter;
