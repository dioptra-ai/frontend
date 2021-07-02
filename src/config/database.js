const mongoose = require('mongoose');
const User = require('../api/user/user.model');

// default connection options
const connectionOptions = {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(process.env.DB_CONNECTION_URI, connectionOptions);

mongoose.connection.on('error', console.error.bind(console, 'DB connection error:'));
mongoose.connection.once('open', async function() {
    console.log('Connected to DB');
    try {
        const userExists = await User.exists();

        if (!userExists) {
            await User.create({username: 'admin', password: 'admin'});
            console.log('Admin User Created');
        }
    } catch (error) {
        console.log('Error Creating User: ', error);
    }


});


