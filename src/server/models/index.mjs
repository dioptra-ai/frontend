import mongoose from 'mongoose';
import User from './user.model.mjs';

// default connection options
const connectionOptions = {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const dbConfig = function() {
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
};

export {dbConfig};
