var assert = require('assert');
var http = require('http');
var fork = require('child_process').fork;
var app = require('../../examples/kitchen-sink');
var request = require('supertest')(app);

describe('Kitchen Sink Example', function() {
    it('exists', function() {
        assert(app != undefined);
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

    it('returns a custom status', function(done) {
        request
            .get('/status/202')
            .expect(202, '202', done);
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
            .expect('Content-Type', 'text/plain; charset=utf-8')
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

    it('sends a file', function(done) {
        request
            .get('/file')
            .expect('file', done);
    });

    it("sendFile fails when file doesn't exist", function(done) {
        request
            .get('/file404')
            .expect(/ENOENT, stat .*file404\.txt/, done);
    });

    it('downloads a file', function(done) {
        request
            .get('/download')
            .expect('Content-Disposition', 'attachment; filename="file123.txt"')
            .expect('file', done);
    });

    function testFormat(type, expectCharset, expected, done) {
        request
            .get('/format')
            .set('Accept', type)
            .expect('Content-Type', type + (expectCharset ? '; charset=utf-8' : ''))
            .expect(expected, done);
    }

    it('formats text', function(done) {
        testFormat('text/plain', true, 'Here is some text', done);
    });

    it('formats html', function(done) {
        testFormat('text/html', true, '<b>Here is some html</b>', done);
    });

    it('formats json', function(done) {
        testFormat('application/json', false, {message: 'Here is some json'}, done);
    });

    it('adds Vary header', function(done) {
        request
            .get('/vary')
            .expect('Vary', 'Accept')
            .expect('Added Vary header', done);
    });

    it('lets providers call next', function(done) {
        request
            .get('/next')
            .expect('Should get here', done);
    });

    it('sets location', function(done) {
        request
            .get('/location')
            .expect('Location', /\/location2/)
            .expect('', done);
    });

    it('sets a cookie', function(done) {
        request
            .get('/cookie/bob')
            .expect('Set-Cookie', 'name=bob; Path=/')
            .expect('Set a cookie', done);
    });
});
