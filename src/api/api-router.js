// Register all routes
const router = require('express').Router();
const UsersController = require('./user/user.controller.js');

router.use('/users', UsersController);

module.exports = router;
