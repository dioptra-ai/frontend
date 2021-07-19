import express from 'express';
import passport from 'passport';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';
import {} from 'dotenv/config';
import {sessionHandler, userAuth} from './src/server/middleware/authentication.mjs';
import ApiRouter from './src/server/api-router.mjs';
import './src/server/models/index.mjs';

// const result = dotenv.config();

// if (result.error) {
//     throw result.error;
// }

const app = express();
const basePath = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(basePath, 'build')));
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
    res.sendFile(resolve(basePath, 'build', 'index.html'));
});

const port = process.env.PORT;

app.listen(port, function () {
    console.log(`Listening on ${port}`);
});
