var molded = require('../');
var app = molded();

var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.value('config', { dbConnectionString: 'mongodb://localhost/test' });

app.singleton('db', function(config) {
    mongoose.connect(config.dbConnectionString);
    return mongoose;
});

app.singleton('Cat', function(db) {
    return mongoose.model('Cat', { name: String });
});

app.use(bodyParser.json());

app.get('/kittens', function(res, Cat) {
    Cat.find(function(err, kittens) {
        if (err) {
            return next(err);
        }
        res.send(kittens);
    });
});

app.post('/kittens', function(req, res, Cat) {
    var kitten = new Cat(req.body);
    kitten.save(function(err) {
        if (err) {
            return next(err);
        }
        res.send({success:true});
    });
});

app.listen(3000);
