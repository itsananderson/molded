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

app.provide('/:user', 'user', function(params, users) {
    return users[params.user];
});

app.get('/me', function(sendJson, user1) {
    sendJson(user1);
});

app.get('/:user', function(sendJson, next, params, user) {
    if (user) {
        sendJson(user);
    } else {
        sendJson({error: params.user + ' does not exist'});
    }
});

/* istanbul ignore else */
if (module.parent) {
    module.exports = app;
} else {
    app.listen(app.value('port'));
}
