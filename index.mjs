import {serverConfig} from './src/server/index.mjs';
serverConfig();

import express from 'express';
import passport from 'passport';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import {userAuth} from './src/server/config/passport.mjs';

const app = express();
const basePath = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(basePath, '/src/client/build')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const sessionStore = new MongoStore({
    mongoUrl: process.env.DB_CONNECTION_URI,
    collectionName: 'sessions'
});

const sessionHandler = session({
    secret: 'some nice secret',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
});

userAuth(passport);

// Middleware to use Session only on api routes
app.use((req, res, next) => {
    if (req.url.indexOf('/api/') === 0) {
        return sessionHandler(req, res, next);
    } else {
        return next();
    }
});

app.use(passport.initialize());
app.use(passport.session());

// Register all controller routes to /api/ basepath
import ApiRouter from './src/server/api-router.mjs';
app.use('/api', ApiRouter);

// Serve frontend on all routes other than /api
app.get('*', (req, res, next) => {
    res.sendFile(resolve(basePath, 'src', 'client', 'build', 'index.html'));
});

const port = process.env.PORT;

app.listen(port, function () {
    console.log(`Running Webpage EXPRESS, Listening on ${port}`);
});
