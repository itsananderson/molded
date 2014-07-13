rest-injector
=============

REST server library with dependency injection

**NOTE: Name subject to change.
If you have a better idea, I'm all ears.**

Installation
---

```
npm install rest-injector
```

Usage
---

rest-injector attempts to be Connect middleware compatible.
If you find something that isn't, please create an issue.

With rest-injector, you define route handlers similar to the ones defined in Express.

```javascript
var injector = require('rest-injector');
var app = injector();

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
var injector = require('rest-injector');

var users = [];

var app = injector();

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
