var injector = require('../');
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
var bodyParser = require('body-parser');
var logger = require('morgan');

var app = injector();

app.value('port', 3000);

app.use(logger('dev'));
app.use(serveStatic(__dirname));
app.use(bodyParser.json());

app.get('/greet/:name/:age', function(req, res) {
    res.send('hello ' + req.params.name +
        ' age ' + req.params.age);
});

app.get(/^\/foo\/bar(.*)$/, function(req, res) {
    res.send(req.params[0]);
});

app.get('/json', function(req, res) {
    res.send({here:'is',some:'json'});
});

app.post('/json', function(req, res) {
    res.send(req.body);
});

app.use(serveIndex(__dirname));

app.listen(app.value('port'));
