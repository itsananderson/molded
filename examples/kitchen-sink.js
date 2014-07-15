var injector = require('../');
var q = require('q');
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
var bodyParser = require('body-parser');

var app = injector();

app.value('port', 3000);

app.singleton('single', function(port) {
    return 'port: ' + port;
});

app.provide('randString', function(single) {
    return single + ' ' + Math.random();
});

app.provide('delay', function() {
    var deferred = q.defer();
    setTimeout(function() {
        deferred.resolve('done delaying');
    }, 1000);
    return deferred.promise;
});

app.provide('promiseError', function() {
    return q.fcall(function() {
        throw Error('Should catch this');
    });
});

app.use(serveStatic(__dirname));
app.use(bodyParser.json());

app.get('/greet/:name/:age', function(params, send) {
    send('hello ' + params.name +
        ' age ' + params.age);
});

app.get(/^\/foo\/bar(.*)$/, function(params, send) {
    send(params[0]);
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

app.get('/accepts', function(res, send, accepts, acceptsEncodings, acceptsCharsets, acceptsLanguages) {
    var stats =
        'favored content type: ' + accepts('txt','html','xml') + '\n' + 
        'favored encoding: ' + acceptsEncodings('gzip') + '\n' + 
        'favored charset: ' + acceptsCharsets('utf8') + '\n' +
        'favored language: ' + acceptsLanguages('en', 'es');
    res.setHeader('Content-Type', 'text/plain');
    send(stats);
});

app.get('/delay', function(delay, send) {
    send('delayed ' + delay);
});

app.get('/error', function(promiseError, send) {
    send("Shouldn't get here");
});

app.error(function(err, res, send) {
    res.statusCode = err.status || 500;
    send(err.message);
});

app.use(serveIndex(__dirname));

if (module.parent) {
    module.exports = app;
} else {
    app.listen(app.value('port'));
}
