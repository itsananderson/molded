var injector = require('../');

var app = injector();

app.value('port', 8080);

app.get('/greet/:name/:age', function(req, res) {
    res.write('hello ' + req.params.name +
        ' age ' + req.params.age);
    res.end();
});

app.listen(app.value('port'));
