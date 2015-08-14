var bodyParser = require('body-parser');
var molded = require('../');

var users = [];

var app = molded();

app.set('port', 3000);

app.use(bodyParser.json());

app.get('/users', function(sendJson) {
    sendJson(users);
});

app.post('/register', function(req, sendJson) {
    users.push(req.body);
    sendJson({success:true});
});

app.post('/purge', function(sendJson) {
    users = [];
    sendJson({success:true});
});

/* istanbul ignore else */
if (module.parent) {
    module.exports = app;
} else {
    app.listen(app.get('port'));
}
