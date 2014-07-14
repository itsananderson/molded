var assert = require('assert');
var http = require('http');
var injection = require('../../examples/injection');
var host = 'localhost';
var port = 3000;
var helper = require('./helper')(host, port);

describe('Injection Example', function() {
    before(function() {
        injection.listen(port);
    });

    it('exists', function() {
        assert(injection != undefined);
    });

    var user1 = {
        username: 'user1',
        email: 'user1@example.com'
    };

    var user2 = {
        username: 'user2',
        email: 'user2@example.com'
    };

    it('knows who I am', function(done) {
        helper.expectJson('/me', user1, done);
    });

    it('finds user1', function(done) {
        helper.expectJson('/user1', user1, done);
    });

    it('finds user2', function(done) {
        helper.expectJson('/user2', user2, done);
    });

    after(function(done) {
        injection.close(function() {
            done();
        });
    });
});
