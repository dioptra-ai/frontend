import {serverConfig} from './src/server/index.mjs';
serverConfig();

import express from 'express';
import passport from 'passport';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';
import {sessionHandler, userAuth} from './src/server/middleware/authentication.mjs';
import ApiRouter from './src/server/api-router.mjs';

const app = express();
const basePath = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(basePath, '/src/client/build')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

userAuth(passport);

app.use(sessionHandler);
app.use(passport.initialize());
app.use(passport.session());

// Register all controller routes to /api/ basepath
app.use('/api', ApiRouter);

// Serve frontend on all routes other than /api
app.get('*', (req, res, next) => {
    res.sendFile(resolve(basePath, 'src', 'client', 'build', 'index.html'));
});

const port = process.env.PORT;

app.listen(port, function () {
    console.log(`Running Webpage EXPRESS, Listening on ${port}`);
});
