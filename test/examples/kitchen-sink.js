var assert = require('assert');
var http = require('http');
var fork = require('child_process').fork;
var kitchenSink = require('../../examples/kitchen-sink');
var host = 'localhost';
var port = 3000;
var request = require('supertest')('http://localhost:3000');

describe('Kitchen Sink Example', function() {
    before(function() {
        kitchenSink.listen(port);
    });

    it('exists', function() {
        assert(kitchenSink != undefined);
    });

    it('greets users with their name and age', function(done) {
        request
            .get('/greet/bob/25')
            .expect('hello bob age 25', done);
    });

    it('returns everything after /foo/bar', function(done) {
        request
            .get('/foo/bar/123')
            .expect('/123', done);
    });

    it('returns json', function(done) {
        request
            .get('/json')
            .expect({"here":"is","some":"json"}, done);
    });

    it('accepts json', function(done) {
        var obj = {"here":"is","some":"json"}; 
        request.
            post('/json')
            .send(obj)
            .expect(obj, done);
    });

    it("gives the port it's configured with", function(done) {
        request
            .get('/port')
            .expect('3000', done);
    });

    it('gives a singleton', function(done) {
        request
            .get('/single')
            .expect('port: 3000', done);
    });

    it('gives a random response', function(done) {
        request
            .get('/rand')
            .expect(/port: 3000 0\.[0-9]+/, done);
    });

    it('checks accepts headers', function(done) {
        var expectedResponse = 'favored content type: txt\n' +
            'favored encoding: gzip\n' +
            'favored charset: utf8\n' +
            'favored language: en';
        request
            .get('/accepts')
            .set('Accept', 'text/plain')
            .set('Accept-Encoding', 'gzip')
            .set('Accept-Charset', 'utf8')
            .set('Accept-Language', 'en')
            .expect(expectedResponse, done);
    });

    it('delays response', function(done) {
        request
            .get('/delay')
            .timeout(100)
            .end(function(err, res) {
                assert(err, 'expected an error');
                assert('number' === typeof err.timeout, 'expected a timeout');
                done();
            });
    });

    it('throws error', function(done) {
        request
            .get('/error')
            .expect(500, 'Should catch this', done);
    });

    after(function(done) {
        kitchenSink.close(function() {
            done();
        });
    });
});
