var injector = require('../');
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');

var app = injector();

app.value('port', 8080);

app.use(serveStatic(__dirname));
app.use(serveIndex(__dirname));

app.get('/greet/:name/:age', function(req, res) {
    res.send('hello ' + req.params.name +
        ' age ' + req.params.age);
});

app.get(/^\/foo\/bar(.*)$/, function(req, res) {
    res.send(req.params[0]);
});

app.listen(app.value('port'));
