const routes = require('express').Router()

const TweetController = require('./controllers/TweetController.controller');
const LikeController = require('./controllers/LikeController.controller');
const AuthorizationController = require('./controllers/Authorization.controller');
const UserController = require('./controllers/UserController.controller');

routes.post('/users/register', UserController.store);
routes.post('/users/auth', UserController.auth);
routes.post('/users/forgot', UserController.forgot);

routes.get('/tweets', TweetController.index);
routes.post('/tweets', AuthorizationController, TweetController.store);
routes.post('/likes/:id', AuthorizationController, LikeController.store);

module.exports = routes;