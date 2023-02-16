import express from 'express';
import compression from 'compression';
import passport from 'passport';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';
import {} from 'dotenv/config';
import {sessionHandler} from './src/server/middleware/authentication.mjs';
import rateLimit from './src/server/middleware/rate-limit.mjs';
import ApiRouter from './src/server/api-router.mjs';
import jsonError from './src/server/middleware/json-error.mjs';
import './src/server/models/index.mjs';

const app = express();
const basePath = dirname(fileURLToPath(import.meta.url));

app.set('x-powered-by', false);
app.use(compression());

app.use(sessionHandler);
app.use(passport.initialize());
app.use(passport.session());

// Send to external documentation page
app.get('/documentation', (req,res) => {
    res.redirect('https://dioptra.gitbook.io/dioptra-doc/EIKhoPaxsbOt062jkPon/')
})
app.use(express.static(join(basePath, 'build')));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true}));

// Register all controller routes to /api/ basepath
app.use('/api', rateLimit, ApiRouter);

// Serve frontend on all routes other than /api
app.get('*', (req, res, next) => {
    res.sendFile(resolve(basePath, 'build', 'index.html'));
});

app.use(jsonError);

const port = process.env.PORT;

app.listen(port, function () {
    console.log(`Listening on ${port}`);
});
