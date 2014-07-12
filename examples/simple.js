var injector = require('../');

var app = injector();

app.value('port', 8080);

app.post('/greet/:name/:age', function(req, res) {
    res.write('hello ' + req.params.name +
        ' age ' + req.params.age);
    res.end();
});

app.listen(app.value('port'));
