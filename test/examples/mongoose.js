var assert = require('assert');
var http = require('http');
var example = require('../../examples/mongoose');
var app = example.app;
var db = example.db;
var _ = require('lodash');
var host = 'localhost';
var port = 3000;
var helper = require('./helper')(host, port);

describe('Mongoose Example', function() {
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
        app.listen(port); 
        helper.postJson('/purge', {}, {success:true}, done);
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
        helper.expectJson('/kittens', [], done);
    });

    it('adds a kitten', function(done) {
        helper.postJson('/kittens', kitten1, {success:true}, function() {
            helper.expectJson('/kittens', function(response) {
                compareKittens([kitten1], JSON.parse(response))
            }, done);
        });
    });

    it('adds multiple kittens', function(done) {
        helper.postJson('/purge', {}, {success:true}, function() {
            helper.postJson('/kittens', kitten1, {success:true}, function() {
                helper.postJson('/kittens', kitten2, {success:true}, function() {
                    helper.expectJson('/kittens', function(response) {
                        compareKittens([kitten1, kitten2], JSON.parse(response))
                    }, done);
                });
            });
        });
    });

    after(function(done) {
        app.close(function() {
            db.disconnect();
            done();
        });
    });
});
