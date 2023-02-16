import express from 'express';
import {isAuthenticated} from '../middleware/authentication.mjs';

import Event from '../models/event.mjs';

const EventsRouter = express.Router();

EventsRouter.all('*', isAuthenticated);

EventsRouter.post('/', async (req, res, next) => {
    try {
        const event = await Event.updateById(
            req.user.requestOrganizationId,
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
