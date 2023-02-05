import express from 'express';
import ApiKey from './controllers/api-key.mjs';
import LoginRouter from './controllers/login.mjs';
import Metrics from './controllers/metrics.mjs';
import MlModelRouter from './controllers/ml-model.mjs';
import OrganizationMembershipRouter from './controllers/organization-membership.mjs';
import OrganizationRouter from './controllers/organization.mjs';
import Timeseries from './controllers/timeseries.mjs';
import UserRouter from './controllers/user.controller.mjs';
import IntegrationRouter from './controllers/integrations.mjs';
import IngestionRouter from './controllers/ingestion.mjs';
import InfrastructureRouter from './controllers/infrastructure.mjs';
import TasksRouter from './controllers/tasks.mjs';
import DatasetRouter from './controllers/dataset.mjs';
import DatapointsRouter from './controllers/datapoints.mjs';
import GroundtruthsRouter from './controllers/groundtruths.mjs';
import EventsRouter from './controllers/events.mjs';

const ApiRouter = express.Router();

ApiRouter.use('/user', UserRouter);
ApiRouter.use('/auth', LoginRouter);
ApiRouter.use('/ml-model', MlModelRouter);
ApiRouter.use('/timeseries', Timeseries);
ApiRouter.use('/metrics', Metrics);
ApiRouter.use('/tasks', TasksRouter);
ApiRouter.use('/api-key', ApiKey);
ApiRouter.use('/organization', OrganizationRouter);
ApiRouter.use('/organization-membership', OrganizationMembershipRouter);
ApiRouter.use('/integration', IntegrationRouter);
ApiRouter.use('/ingestion', IngestionRouter);
ApiRouter.use('/infrastructure', InfrastructureRouter);
ApiRouter.use('/datapoints', DatapointsRouter);
ApiRouter.use('/groundtruths', GroundtruthsRouter);
ApiRouter.use('/dataset', DatasetRouter);
ApiRouter.use('/events', EventsRouter);

export default ApiRouter;
