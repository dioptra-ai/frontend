import rateLimit from 'express-rate-limit';

const rateLimitMiddleware = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
    keyGenerator: (req) => req.headers['x-api-key'] || req.sessionID
});

export default rateLimitMiddleware;
