var molded = require('../');
var app = molded();

app.get('/', function() {
    throw Error('Something went wrong');
});

app.get('/next', function(next) {
    next(Error('Something went wrong next'));
});

app.error(function(res, err)  {
    res.statusCode = err.status || 500;
    res.send({message: err.message, error: err});
});

app.listen(3000);
