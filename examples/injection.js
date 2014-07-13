var molded = require('../');
var app = molded();

app.value('users', {
    'user1': {
        username: 'user1',
        email: 'user1@example.com'
    },
    'user2': {
        username: 'user2',
        email: 'user2@example.com'
    }
});

app.singleton('user1', function(users) {
    return users['user1'];
});
app.provide('user', function(req, res, users) {
    // req.params comes from the route handler's route
    return users[req.params.user];
});

app.get('/me', function(sendJson, user1) {
    sendJson(user1);
});

app.get('/:user', function(sendJson, next, user) {
    if (user) {
        sendJson(user);
    } else {
        next();
    }
});

app.listen(3000);
