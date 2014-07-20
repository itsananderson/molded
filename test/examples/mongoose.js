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
var request = require('supertest')(app);

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

    it('throws error when inserting the same id', function(done) {
        var id = '53cbb6b2eae2e0781ef95784';
        var cat1 = {
            _id: id,
            name: 'Fluffy'
        };
        var cat2 = {
            _id: id,
            name: 'Mittens'
        };
        function purge() {
            request
                .post('/purge')
                .send({})
                .expect({success:true}, addCat1);
        }
        function addCat1(err) {
            if (err) return done(err);
            request
                .post('/kittens')
                .send(cat1)
                .expect({success:true})
                .end(addCat2);
        }
        function addCat2(err) {
            if (err) return done(err);
            request
                .post('/kittens')
                .send(cat2)
                .end(function(err, result) {
                    assert(/E11000 duplicate key error index/
                        .test(result.body.err),
                        'Unexpected error: ' + result.body.err);
                    done();
                });
        }
        purge(); // Kick off call chain
    });

    after(function() {
        db.disconnect();
    });
});
