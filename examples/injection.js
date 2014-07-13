var logger = require('morgan');
var injector = require('../');
var app = injector();

app.use(logger('dev'));

app.provide('users', function() {
    return {
        'user1': {
            username: 'user1',
            email: 'user1@example.com'
        },
        'user2': {
            username: 'user2',
            email: 'user2@example.com'
        }
    };
});

app.provide('user', function(req, res, users) {
    return users[req.params.user];
});

app.get('/:user', function(req, res, next, user) {
    if (user) {
        res.send(user);
    } else {
        next();
    }
});

app.listen(3000);
