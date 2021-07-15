import express from 'express';
import mongoose from 'mongoose';

const DashboardRouter = express.Router();

DashboardRouter.get('/', async (req, res, next) => {

    try {
        const Dashboard = mongoose.model('Dashboard');

        res.json(await Dashboard.find());
    } catch (e) {
        next(e);
    }
});

export default DashboardRouter;