import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';

import Event from '../models/event.mjs';

const EventsRouter = express.Router();

EventsRouter.all('*', isAuthenticated);

EventsRouter.post('/', async (req, res, next) => {
    try {
        const {activeOrganizationMembership} = req.user;
        const event = await Event.updateById(
            activeOrganizationMembership.organization._id,
            req.body.eventId,
            req.body.column,
            req.body.value
        );

        res.json(event);
    } catch (e) {
        next(e);
    }
});

export default EventsRouter;
