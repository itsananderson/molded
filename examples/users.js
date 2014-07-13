var bodyParser = require('body-parser');
var injector = require('../');

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
