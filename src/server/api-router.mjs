import express from 'express';
import ApiKey from './controllers/api-key.mjs';
import AuthRouter from './controllers/auth.controller.mjs';
import Metrics from './controllers/metrics.mjs';
import MlModelRouter from './controllers/ml-model.mjs';
import OrganizationMembershipRouter from './controllers/organization-membership.mjs';
import OrganizationRouter from './controllers/organization.mjs';
import Timeseries from './controllers/timeseries.mjs';
import UserRouter from './controllers/user.controller.mjs';

const ApiRouter = express.Router();

ApiRouter.use('/user', UserRouter);
ApiRouter.use('/auth', AuthRouter);
ApiRouter.use('/ml-model', MlModelRouter);
ApiRouter.use('/timeseries', Timeseries);
ApiRouter.use('/metrics', Metrics);
ApiRouter.use('/api-key', ApiKey);
ApiRouter.use('/organization', OrganizationRouter);
ApiRouter.use('/organization-membership', OrganizationMembershipRouter);

export default ApiRouter;
