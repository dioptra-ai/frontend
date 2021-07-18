import express from 'express';
const ApiRouter = express.Router();

import UserRouter from './controllers/user.controller.mjs';
import AuthRouter from './controllers/auth.controller.mjs';
import DashboardRouter from './controllers/dashboard.mjs';
import MlModelRouter from './controllers/ml-model.mjs';
import Timeseries from './controllers/timeseries.mjs';

ApiRouter.use('/user', UserRouter);
ApiRouter.use('/auth', AuthRouter);
ApiRouter.use('/dashboard', DashboardRouter);
ApiRouter.use('/ml-model', MlModelRouter);
ApiRouter.use('/timeseries', Timeseries);

export default ApiRouter;
