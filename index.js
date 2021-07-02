require('./src/libs/load-variables');
require('./src/config/database');

const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '/src/client/build')));

// Register all controller routes to /api/ basepath
const ApiRouter = require('./src/api/api-router.js');

app.use('/api', ApiRouter);

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'src', 'client', 'build', 'index.html'));
});

const port = process.env.PORT;

app.listen(port, function () {
    console.log(`Running Webpage EXPRESS, Listening on ${port}`);
});
