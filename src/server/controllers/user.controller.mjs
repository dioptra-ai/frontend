import express from 'express';
const UserRouter = express.Router();

// define the home page route
UserRouter.get('/', function (req, res, next) {
    res.send('USERS home page');
});
// define the about route
UserRouter.get('/about', function (req, res, next) {
    res.send('About users');
});

export default UserRouter;
