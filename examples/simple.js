var injector = require('../');
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
var bodyParser = require('body-parser');
var logger = require('morgan');

var app = injector();

app.value('port', 3000);

app.singleton('single', function(port) {
    return 'port: ' + port;
});

app.provide('randString', function(single) {
    return single + ' ' + Math.random();
});

app.use(logger('dev'));
app.use(serveStatic(__dirname));
app.use(bodyParser.json());

app.get('/greet/:name/:age', function(req, send) {
    send('hello ' + req.params.name +
        ' age ' + req.params.age);
});

app.get(/^\/foo\/bar(.*)$/, function(req, send) {
    send(req.params[0]);
});

app.get('/json', function(req, sendJson) {
    sendJson({here:'is',some:'json'});
});

app.post('/json', function(req, sendJson) {
    sendJson(req.body);
});

app.get('/port', function(sendJson, port) {
    sendJson(port);
});

app.get('/single', function(send, single) {
    send(single);
});

app.get('/rand', function(send, randString) {
    send(randString);
});

app.get('/accepts', function(res, send, accepts, acceptsEncodings, acceptsCharsets) {
    var stats =
        'favored content type: ' + accepts('txt','html','xml') + '\n' + 
        'favored encoding: ' + acceptsEncodings('gzip') + '\n' + 
        'favored charset: ' + acceptsCharsets('utf8');
    res.setHeader('Content-Type', 'text/plain');
    send(stats);
});

app.use(serveIndex(__dirname));

app.listen(app.value('port'));
