var molded = require('../');
var app = molded();

app.get('/', function() {
    throw Error('Something went wrong');
});

app.get('/next', function(next) {
    next(Error('Something went wrong next'));
});

app.get('/fail', function() {
    throw Error('What happens if the error handler fails?');
});

app.error('/fail', function() {
    // Undefined
    res.statusCode = err.status || 500;
});

app.error(function(res, sendJson, err)  {
    res.statusCode = err.status || 500;
    sendJson({message: err.message, error: err});
});

app.listen(3000);
