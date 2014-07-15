var molded = require('../');
var app = molded();

app.value('port', 3000);

// If a provider throws an exception, it is sent to the error handlers matching the request's route.
app.provide('broken', function() {
    throw Error('Oh noes');
});
app.get('/broken', function(broken) {
    throw Error("Shouldn't get here");
});

// If an error handler fails, the exception from the error handler is
// passed on to the next error handler
app.get('/fail', function() {
    throw Error('What happens if the error handler fails?');
});
app.error('/fail', function() {
    // 'something' is undefined
    console.log(something);
});

// If a route handler throws an exception, it's sent to the error handler(s) that match the route
app.get('/', function() {
    throw Error('Something went wrong');
});

// Use next(err) for things like async callbacks
app.get('/next', function(next) {
    next(Error('Something went wrong next'));
});

app.error(function(res, sendJson, err)  {
    res.statusCode = err.status || 500;
    sendJson({message: err.message, error: err});
});

if (module.parent) {
    module.exports = app;
} else {
    app.listen(app.value('port'));
}
