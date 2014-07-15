// Skip MongoDB tests if running in Travis CI
// Variable is configured in the Travis config
if (process.env.TRAVIS) {
    return;
}

var assert = require('assert');
var http = require('http');
var example = require('../../examples/mongoose');
var app = example.app;
var db = example.db;
var _ = require('lodash');
var host = 'localhost';
var port = 3000;
var request = require('supertest')('http://localhost:3000');

describe('Mongoose Example', function() {
    var server;
    before(function(done) {
        // Small kludge:
        // If the Cat model is already defined, inject it as a value
        // Otherwise the app will try to redefine it when the singleton resolves
        var model = _.find(db.models, function(model) {
            return model.modelName === 'Cat';
        });
        if (model) {
            app.value('Cat', model);
        }
        server = app.listen(port); 
        request
            .post('/purge')
            .send({})
            .expect({success:true}, done);
    });

    it('exists', function() {
        assert(app != undefined);
    });

    var kitten1 = {
        name: 'Mittins'
    };

    var kitten2 = {
        name: 'Fluffy'
    };

    // Compare two arrays of kittens, ignoring Mongo metadata
    function compareKittens(expected, actual) {
        assert.equal(actual.length, expected.length);
        expected.forEach(function(expectedKitten, i) {
            var actualKitten = actual[i];
            assert.equal(actualKitten.name, expectedKitten.name);
        });
    }

    it('starts with no kittens', function(done) {
        request
            .get('/kittens')
            .expect([], done);
    });

    it('adds a kitten', function(done) {
        request
            .post('/kittens')
            .send(kitten1)
            .expect({success:true})
            .end(function() {
                request
                    .get('/kittens')
                    .end(function(err, res) {
                        compareKittens([kitten1], res.body);
                        done();
                    });
            });
    });

    it('adds multiple kittens', function(done) {
        function purge() {
            request
                .post('/purge')
                .send({})
                .expect({success:true}, addKitten1);
        }
        function addKitten1(err) {
            if (err) return done(err);
            request
                .post('/kittens')
                .send(kitten1)
                .expect({success:true})
                .end(addKitten2);
        }
        function addKitten2(err) {
            if (err) return done(err);
            request
                .post('/kittens')
                .send(kitten2)
                .expect({success:true})
                .end(getKittens);
        }
        function getKittens(err) {
            if (err) return done(err);
            request
                .get('/kittens')
                .end(function(err, res) {
                    if (err) return done(err);
                    compareKittens([kitten1, kitten2], res.body);
                    done();
                });
        }
        purge(); // Kick off call chain
    });

    after(function(done) {
        server.close(function() {
            db.disconnect();
            done();
        });
    });
});
