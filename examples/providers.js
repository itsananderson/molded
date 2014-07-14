var util = require('util');
var molded = require('../');
var app = molded();

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


app.get('/range', function(range, res, send) {
    res.setHeader('Content-Type', 'text/plain');
    var requestedRange = range(1024);
    if (requestedRange) {
        var message = util.format('Range: "%s" ', requestedRange.type);
        message += requestedRange.map(function(range) {
            return util.format('\n\tStart: %d,\tEnd: %d', range.start, range.end); 
        }).join(' ');
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

app.listen(3000);
