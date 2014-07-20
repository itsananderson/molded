var util = require('util');
var molded = require('../');
var app = molded();

app.value('port', 3000);

// TODO: Add examples for other core providers

app.get('/languages', function(acceptsLanguages, send) {
    supportedLangs = {
        'en': 'In English',
        'es': 'En Español'
    };
    var lang = acceptsLanguages.apply(null, Object.keys(supportedLangs));
    if (lang) {
        send(supportedLangs[lang]);
    } else {
        send('Requested language(s) not supported');
    }
});


app.get('/range', function(range, res, send, contentType) {
    contentType('txt');
    var requestedRange = range(1024);
    if (requestedRange) {
        var message = util.format('Range: "%s"\n', requestedRange.type);
        message += requestedRange.map(function(range) {
            return util.format('\tStart: %d,\tEnd: %d', range.start, range.end); 
        }).join('\n');
        send(message);
    } else {
        send('No range header specified');
    }
});

app.post('/typeis', function(typeIs, send) {
    if (typeIs('application/json')) {
        send('Thanks for the JSON :)');
    } else {
        send('Only application/json is accepted');
    }
});

app.post('/typeis-alt', function(typeIs, send) {
    if (typeIs(['application/json'])) {
        send('Thanks for the JSON :)');
    } else {
        send('Only application/json is accepted');
    }
});

/* istanbul ignore else */
if (module.parent) {
    module.exports = app;
} else {
    app.listen(app.value('port'));
}
