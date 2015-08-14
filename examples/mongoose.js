var q = require('q');
var express = require('express');
var molded = require('../');
var app = express();

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var connectionString = 'mongodb://localhost/test';
mongoose.connect(connectionString);

app.set('port', 3000);

app.set('config', { db: mongoose, dbConnectionString: connectionString });

app.use(molded.provide('Cat', function catModelProvider(config) {
    if (!catModelProvider.model) {
        catModelProvider.model = config.db.model('Cat', { name: String });
    }
    return catModelProvider.model;
}));

app.use(bodyParser.json());

app.get('/kittens', function(sendJson, Cat) {
    return q.ninvoke(Cat, 'find').then(function(kittens) {
        sendJson(kittens);
    });    
});

app.post('/kittens', function(req, sendJson, Cat) {
    var kitten = new Cat(req.body);
    return q.ninvoke(kitten, 'save').then(function() {
        sendJson({success:true});
    });
});

app.post('/purge', function(req, sendJson, Cat) {
    return q.ninvoke(Cat, 'remove').then(function() {
        sendJson({success:true});
    });
});

app.use(function(err, req, res, next) {
    res.json(err);
});

/* istanbul ignore else */
if (module.parent) {
    module.exports = {app:app,db:mongoose};
} else {
    app.listen(app.get('port'));
}
