molded
======

REST server library with dependency injection

Installation
---

```
npm install molded
```

Usage
---

Molded attempts to be Connect middleware compatible.
If you find something that isn't, please create an issue.

With Molded, you define route handlers similar to the ones defined in Express.

```javascript
var molded = require('molded');
var app = molded();

app.get('/', function(req, res) {
    res.send({"welcome":"home"});
});

app.get('/:name', function(req, res) {
    res.send({"hello":req.params.name);
});

app.listen(3000);
```

You can plug in Connect middleware like body-parser and serve-static.

```javascript
var bodyParser = require('body-parser');
var molded = require('molded');

var users = [];

var app = molded();

app.use(bodyParser.json());

app.get('/users', function(req, res) {
    res.send(users);
});

app.post('/register', function(req, res) {
    users.push(req.body);
    res.send({success:true});
});

app.listen(3000);
```

### Dependency Injection

The primary advantage of Molded is that it makes it easy to inject dependencies into route handlers.

The following examples illustrate some of the things that can be done with dependency injection.

```javascript
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

app.get('/me', function(res, user1) {
    res.send(user1);
});

app.get('/:user', function(req, res, next, user) {
    if (user) {
        res.send(user);
    } else {
        next();
    }
});

app.listen(3000);
```
