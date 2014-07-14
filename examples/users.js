var bodyParser = require('body-parser');
var molded = require('../');

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
