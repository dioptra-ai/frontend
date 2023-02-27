import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

const setupSentry = (app) => {
    Sentry.init({
        dsn: 'https://44baec8d900a47d1a2d8cb0f8b115185@o1152673.ingest.sentry.io/4504749445545984',
        release: process.env.COMMIT_REF,
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({tracing: true}),
            // enable Express.js middleware tracing
            new Tracing.Integrations.Express({app})
        ],
        environment: process.env.ENVIRONMENT,
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0
    });

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
};

export default setupSentry;
