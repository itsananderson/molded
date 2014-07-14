var assert = require('assert');
var http = require('http');
var error = require('../../examples/error');
var host = 'localhost';
var port = 3000;
var helper = require('./helper')(host, port);

describe('Errors Example', function() {
    before(function() {
        error.listen(port);
    });

    it('exists', function() {
        assert(error != undefined);
    });

    it('falls through error handlers', function(done) {
        helper.expectGetResponse('/fail', function(str) {
            var response = JSON.parse(str);
            assert.equal(response.message, 'something is not defined');
        }, done);
    });

    it('handles exceptions thrown by the handler', function(done) {
        helper.expectGetResponse('/', function(str) {
            var response = JSON.parse(str);
            assert.equal(response.message, 'Something went wrong');
        }, done);
    });

    it('handles exceptions sent to next()', function(done) {
        helper.expectGetResponse('/next', function(str) {
            var response = JSON.parse(str);
            assert.equal(response.message, 'Something went wrong next');
        }, done);
    });

    after(function(done) {
        error.close(function() {
            done();
        });
    });
});
