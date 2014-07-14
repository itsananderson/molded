var assert = require('assert');
var http = require('http');
var fork = require('child_process').fork;
var kitchenSink = require('../../examples/kitchen-sink');
var host = 'localhost';
var port = 3000;
var helper = require('./helper')(host, port);

describe('Kitchen Sink Example', function() {
    before(function() {
        kitchenSink.listen(port);
    });

    it('exists', function() {
        assert(kitchenSink != undefined);
    });

    it('greets users with their name and age', function(done) {
        helper.expectGetResponse('/greet/will/23',  'hello will age 23', done);
    });

    it('returns everything after /foo/bar', function(done) {
        helper.expectGetResponse('/foo/bar/123',  '/123', done);
    });

    it('returns json', function(done) {
        helper.expectJson('/json', {"here":"is","some":"json"}, done);
    });

    it('accepts json', function(done) {
        var obj = {"here":"is","some":"json"}; 
        helper.postJson('/json', obj, obj, done);
    });

    it("gives the port it's configured with", function(done) {
        helper.expectGetResponse('/port', '3000', done);
    });

    it('gives a singleton', function(done) {
        helper.expectGetResponse('/single', 'port: 3000', done);
    });

    it('gives a random response', function(done) {
        helper.expectGetResponse('/rand', /port: 3000 0\.[0-9]+/, done);
    });

    it('checks accepts headers', function(done) {
        var opts = {
            host: host,
            port: port,
            path: '/accepts',
            headers: {
                'accept': 'text/plain',
                'accept-encoding': 'gzip',
                'accept-charset': 'utf8',
                'accept-language': 'en'
            },
            method: 'GET'
        };
        var expectedResponse = 'favored content type: txt\n' +
            'favored encoding: gzip\n' +
            'favored charset: utf8\n' +
            'favored language: en';
        helper.expectGetResponse(opts, expectedResponse, done);
    });

    it('delays response', function(done) {
        var finished = false;
        var opts = {
            host: host,
            port: port,
            path: '/delay',
            method: 'GET'
        };
        req = http.request(opts, function(res) {
            res.on('data', function() {});
            res.on('end', function() {
                assert(false, "Didn't delay");
                done();
            });
        });

        req.on('error', function(err) {
            if ('socket hang up' === err.message) {
                done();
            } else {
                throw err;
            }
        });

        req.setTimeout(100, req.abort.bind(req));
        req.end();
    });

    it('throws error', function(done) {
        helper.expectGetResponse('/error', 'Should catch this', function(err, text, res) {
            assert.equal(res.statusCode, 500);
            done();
        });
    });

    after(function(done) {
        kitchenSink.close(function() {
            done();
        });
    });
});
