import express from 'express';
import rateLimit from 'express-rate-limit';

const rateLimitMiddleware = express.Router().use(
    rateLimit({
        windowMs: 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many requests, please try again later.',
        keyGenerator: (req) => req.headers['x-api-key'] || req.sessionID
    }),
    rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many errors, please try again later.',
        skipSuccessfulRequests: true,
        keyGenerator: (req) => req.headers['x-api-key'] || req.sessionID
    })
);

export default rateLimitMiddleware;
