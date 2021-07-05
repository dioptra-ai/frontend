import {serverConfig} from './src/server/index.mjs';
serverConfig();

import express from 'express';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';

const app = express();
const basePath = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(basePath, '/src/client/build')));

// Register all controller routes to /api/ basepath
import ApiRouter from './src/server/api-router.mjs';

app.use('/api', ApiRouter);

// Serve frontend
app.get('*', (req, res, next) => {
    res.sendFile(resolve(basePath, 'src', 'client', 'build', 'index.html'));
});

const port = process.env.PORT;

app.listen(port, function () {
    console.log(`Running Webpage EXPRESS, Listening on ${port}`);
});
