const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    username: 'string',
    password: 'string'
});

module.exports = mongoose.model('User', schema);
