var bodyParser = require('body-parser');
var injector = require('../');

var users = [];

var app = injector();

app.use(bodyParser.json());

app.get('/users', function(sendJson) {
    sendJson(users);
});

app.post('/register', function(req, sendJson) {
    users.push(req.body);
    sendJson({success:true});
});

app.listen(3000);
