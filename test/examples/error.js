var assert = require('assert');
var http = require('http');
var error = require('../../examples/error');
var host = 'localhost';
var port = 3000;
var request = require('supertest')('http://localhost:3000');

describe('Errors Example', function() {
    before(function() {
        error.listen(port);
    });

    it('exists', function() {
        assert(error != undefined);
    });

    it('falls through error handlers', function(done) {
        request
            .get('/fail')
            .end(function(err, res) {
                assert.equal(res.body.message, 'something is not defined');
                done();
            });
    });

    it('handles exceptions thrown by the handler', function(done) {
        request
            .get('/')
            .end(function(err, res) {
                assert.equal(res.body.message, 'Something went wrong');
                done();
            });
    });

    it('handles exceptions sent to next()', function(done) {
        request
            .get('/next')
            .end(function(err, res) {
                assert.equal(res.body.message, 'Something went wrong next');
                done();
            });
    });

    after(function(done) {
        error.close(function() {
            done();
        });
    });
});
