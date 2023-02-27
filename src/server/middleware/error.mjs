import * as Sentry from '@sentry/node';

export default [
    Sentry.Handlers.errorHandler(),
    (err, req, res, next) => { // eslint-disable-line no-unused-vars
        console.error(err.stack);

        if (res.statusCode === 200) {
            res.status(500);
        }

        res.json({
            error: {
                message: err.message
            }
        });
    }
];
