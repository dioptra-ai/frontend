const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const User = require('./src/server/models/user');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        // seed first admin
        User.exists().then((exists) => {
            if (!exists) {
                User.create({
                    username: 'admin',
                    password: 'admin'
                }).then(() => console.log('Admin user created'));
            }
        });
    });

app.use(express.static(path.join(__dirname, '/build')));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

// Serve API
// Register all controller routes to /api/ basepath
require('./src/server/controllers')(app, '/api/');

const port = 4004;

app.listen(port, function () {
    console.log(`Running Webpage EXPRESS, Listening on ${port}`);
});
