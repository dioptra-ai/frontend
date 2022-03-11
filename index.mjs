import express from 'express';
import compression from 'compression';
import passport from 'passport';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';
import {} from 'dotenv/config';
import {sessionHandler, userAuth} from './src/server/middleware/authentication.mjs';
import ApiRouter from './src/server/api-router.mjs';
import jsonError from './src/server/middleware/json-error.mjs';
import {isAuthenticated} from './src/server/middleware/authentication.mjs';
import './src/server/models/index.mjs';

const app = express();
const basePath = dirname(fileURLToPath(import.meta.url));

app.set('x-powered-by', false);
app.use(compression());

userAuth(passport);
app.use(sessionHandler);
app.use(passport.initialize());
app.use(passport.session());

app.use('/documentation', isAuthenticated);
app.use(express.static(join(basePath, 'build')));


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true}));

// Register all controller routes to /api/ basepath
app.use('/api', ApiRouter);


// Serve frontend on all routes other than /api
app.get('*', (req, res, next) => {
    res.sendFile(resolve(basePath, 'build', 'index.html'));
});

app.use(jsonError);

const port = process.env.PORT;

app.listen(port, function () {
    console.log(`Listening on ${port}`);
});
