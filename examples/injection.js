var express = require('express');
var app = express();
var molded = require('../');

app.set('port', 3000);
app.set('users', {
    'user1': {
        username: 'user1',
        email: 'user1@example.com'
    },
    'user2': {
        username: 'user2',
        email: 'user2@example.com'
    }
});

app.use(molded.provide('user1', function(users) {
    return users['user1'];
}));

app.use('/:user', molded.provide('user', function(params, users) {
    return users[params.user];
}));

app.get('/me', molded.inject(function(res, user1) {
    res.send(user1);
}));

app.get('/:user', molded.inject(function(req, res, user) {
    if (user) {
        sendJson(user);
    } else {
        sendJson({error: params.user + ' does not exist'});
    }
}));

/* istanbul ignore else */
if (module.parent) {
    module.exports = app;
} else {
    app.listen(app.get('port'));
}
