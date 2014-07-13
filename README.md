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
