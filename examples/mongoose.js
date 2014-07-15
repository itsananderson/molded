var q = require('q');
var molded = require('../');
var app = molded();

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var connectionString = 'mongodb://localhost/test';
mongoose.connect(connectionString);

app.value('port', 3000);

app.value('config', { db: mongoose, dbConnectionString: connectionString });

app.singleton('Cat', function(config) {
    return config.db.model('Cat', { name: String });
});

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

app.error(function(err, sendJson) {
    sendJson(err);
});

if (module.parent) {
    module.exports = {app:app,db:mongoose};
} else {
    app.listen(app.value('port'));
}
