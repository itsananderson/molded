var injector = require('../');
var app = injector();

var users = {
    'user1': {
        username: 'user1',
        email: 'user1@example.com'
    },
    'user2': {
        username: 'user2',
        email: 'user2@example.com'
    }
};

app.provide('user', function(req, res) {
    return users[req.params.user];
});

app.get('/:user', function(req, res, user) {
    res.send(user);
});

app.listen(3000);
