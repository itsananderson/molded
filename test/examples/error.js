var assert = require('assert');
var http = require('http');
var app = require('../../examples/error');
var request = require('supertest')(app);

describe('Errors Example', function() {
    it('exists', function() {
        assert(app != undefined);
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
});
