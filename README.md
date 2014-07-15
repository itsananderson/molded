molded [![NPM version](https://badge.fury.io/js/molded.png)](http://badge.fury.io/js/molded) [![Builds](https://api.travis-ci.org/repositories/itsananderson/molded.png?branch=master)](https://travis-ci.org/itsananderson/molded)
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

// send() automatically sends objects as JSON
app.get('/', function(req, send) {
    send({
        welcome: "home"
    });
});

// Use sendJson() to always send JSON, regardless of data type
app.get('/:name', function(params, sendJson) {
    sendJson({
        "hello": params.name
    });
});

app.listen(3000);
```

You can plug in Connect middleware like body-parser.

```javascript
var bodyParser = require('body-parser');
var molded = require('molded');

var users = [];

var app = molded();

app.use(bodyParser.json());

app.get('/users', function(sendJson) {
    sendJson(users);
});

app.post('/register', function(req, sendJson) {
    users.push(req.body);
    sendJson({success:true});
});

app.listen(3000);
```

### Dependency Injection

The primary advantage of Molded is that it makes it easy to inject dependencies into route handlers.

The following examples illustrate some of the things that can be done with dependency injection.

#### app.value(name, val)

If you want to provide a fixed value to your app, you can use `app.value('name', val)`

For example, to hardcode a list of users:

```javascript
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
```

#### app.singleton(name, func)

If you want to provide a hardcoded value, but need to inject other dependencies, use `app.singleton('name', func)`

Singletons are only called once, during app setup.

For example, to inject user1 from the previous example:

```javascript
app.singleton('user1', function(users) {
    return users['user1'];
});

app.get('/me', function(res, sendJson) {
    sendJson(user1);
});
```

As a more practical example, consider the following Mongoose database setup.

```javascript
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.value('config', { dbConnectionString: 'mongodb://localhost/test' });

app.singleton('db', function(config) {
    mongoose.connect(config.dbConnectionString);
    return mongoose;
});

app.singleton('Cat', function(db) {
    return mongoose.model('Cat', { name: String });
});

app.use(bodyParser.json());

app.get('/kittens', function(sendJson, Cat) {
    Cat.find(function(err, kittens) {
        if (err) {
            return next(err);
        }
        sendJson(kittens);
    });
});

app.post('/kittens', function(req, sendJson, Cat) {
    var kitten = new Cat(req.body);
    kitten.save(function(err) {
        if (err) {
            return next(err);
        }
        sendJson({success:true});
    });
});
```

#### app.provide(name, func)

If you need to inject a custom value for each request, use `app.provide('name', func)`

For example, to look up a user based on an app route:

```javascript
app.provide('/:user', 'user', function(params, users) {
    return users[params.user];
});

app.get('/:user', function(sendJson, next, user) {
    if (user) {
        sendJson(user);
    } else {
        next();
    }
});
```
Error Handling
---

Error handling in Molded is slightly different than Express. To catch errors, use `app.error()`.

Calling `app.error('/route', handler)` only handles errors from that route.
Calling `app.error(handler)` handles errors for all routes.

```javascript
// If a provider throws an exception, it is sent to the error handlers matching the request's route.
app.provide('broken', function() {
    throw Error('Oh noes');
});
app.get('/broken', function(broken) {
    throw Error("Shouldn't get here");
});

// If an error handler fails, the exception from the error handler is
// passed on to the next error handler
app.get('/fail', function() {
    throw Error('What happens if the error handler fails?');
});
app.error('/fail', function() {
    // 'something' is undefined
    console.log(something);
});

// If a route handler throws an exception, it's sent to the error handler(s) that match the route
app.get('/', function() {
    throw Error('Something went wrong');
});

// Use next(err) for things like async callbacks
app.get('/next', function(next) {
    next(Error('Something went wrong next'));
});

app.error(function(res, sendJson, err)  {
    res.statusCode = err.status || 500;
    sendJson({message: err.message, error: err});
});
```

Promises
---

In Molded, promises are first-class citizens.
Providers that need to make async calls can wrap them in promises.
Molded will wait until the promise resolves before passing the result on to whatever depends on that provider.

If a promise throws an exception, Molded passes the exception to the app's error handler.
If no error handler is present, Molded sends a 500 with a generic error message.

The following example shows how to provide a simple MongoDB backed API using Mongoose.
Notice that the API endpoints use `q.ninvoke` to call the Mongoose methods.
By returning this promise from the handler, we let Molded worry about handling any errors returned by Mongoose.

```javascript
var q = require('q');
var molded = require('molded');
var app = molded();

var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.value('config', { dbConnectionString: 'mongodb://localhost/test' });

app.singleton('db', function(config) {
    mongoose.connect(config.dbConnectionString);
    return mongoose;
});

app.singleton('Cat', function(db) {
    return mongoose.model('Cat', { name: String });
});

app.use(bodyParser.json());

app.get('/kittens', function(sendJson, Cat) {
    return q.ninvoke(Cat, 'find').then(function(kittens) {
        sendJson(kittens);
    });    
});

app.post('/kittens', function(req, sendJson, Cat) {
    var kitten = new Cat(req.body);
    return q.ninvoke(kitten, 'save').then(function() {
        sendJson({success:true});
    });
});

app.listen(3000);
```
