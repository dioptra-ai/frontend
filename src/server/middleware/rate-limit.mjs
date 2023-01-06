import rateLimit from 'express-rate-limit';

const rateLimitMiddleware = rateLimit({
    windowMs: 60 * 1000,
    max: 100, // limit each IP to 100 requests per windowMs'
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    handler: (req, res) => {
        console.log(`Rate limit exceeded for IP: ${req.ip}, ${req.rateLimit}`);

        res.status(429).json({
            message: 'Too many requests from this IP, please try again after 15 minutes'
        });
    }
});

export default rateLimitMiddleware;
