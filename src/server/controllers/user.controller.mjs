import express from 'express';
const UserRouter = express.Router();

// define the home page route
// eslint-disable-next-line no-unused-vars
UserRouter.get('/', function (req, res, next) {
    res.send('USERS home page');
});
// define the about route
// eslint-disable-next-line no-unused-vars
UserRouter.get('/about', function (req, res, next) {
    res.send('About users');
});

export default UserRouter;
