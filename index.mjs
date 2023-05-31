import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import passport from 'passport';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';
import {} from 'dotenv/config';
import {engine} from 'express-handlebars';

import setupSentry from './src/server/middleware/sentry.mjs';
import {sessionHandler} from './src/server/middleware/authentication.mjs';
import rateLimit from './src/server/middleware/rate-limit.mjs';
import ApiRouter from './src/server/api-router.mjs';
import handleErrors from './src/server/middleware/error.mjs';
import './src/server/models/index.mjs';

const { ENVIRONMENT } = process.env;

const app = express();
const basePath = dirname(fileURLToPath(import.meta.url));

setupSentry(app);

app.set('x-powered-by', false);
app.use(compression());

app.use(sessionHandler);
app.use(passport.initialize());
app.use(passport.session());

// Send to external documentation page
app.get('/documentation', (req,res) => {
    res.redirect('https://dioptra.gitbook.io/dioptra-doc/EIKhoPaxsbOt062jkPon/')
})
app.use('/static', express.static(join(basePath, 'build')));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true}));

app.use(morgan(ENVIRONMENT === 'local-dev' ? 'dev' : ':remote-addr - [:date[iso]] ":method :url" status: :status, length: :res[content-length] B ttfb: :response-time ms., ttlb: :total-time ms., UA: :user-agent'));

// Register all controller routes to /api/ basepath
app.use('/api', rateLimit, ApiRouter);

// Serve client on all routes other than /api

app.engine('html', engine({defaultLayout: false, extname: '.html'}));
app.set('view engine', 'handlebars'); 
app.set('views', resolve(basePath, 'build'));
app.get('*', (req, res, next) => {
    res.render(resolve(basePath, 'build/index.html'), {
        env: {
            name: ENVIRONMENT,
            disabledUsageFeedback: process.env.DISABLE_USAGE_FEEDBACK
        }
    });
});

app.use(handleErrors);

app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
});

app.listen(process.env.INTERNAL_PORT, () => {
    console.log(`Listening on ${process.env.INTERNAL_PORT}`);
});
