var assert = require('assert');
var http = require('http');
var fork = require('child_process').fork;
var app = require('../../examples/kitchen-sink');
var request = require('supertest')(app);

var sign = require('cookie-signature').sign;
var cookie = require('cookie');

describe('Kitchen Sink Example', function() {
    it('exists', function() {
        assert(app != undefined);
    });

    it('sends 404 if no route found', function(done) {
        request
            .get('/notfound')
            .expect("Can't GET /notfound", done);
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

    it('returns a buffer', function(done) {
        request
            .get('/send-buffer')
            .expect('hello buffer', done);
    });

    it('returns json with send', function(done) {
        request
            .get('/send-json')
            .expect({success:true}, done);
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

    it('has optional dependencies', function(done) {
        request
            .get('/randOptional')
            .expect('undefined', done);
    });

    it('has optional dependencies with defaults', function(done) {
        request
            .get('/randOptionalDefault')
            .expect('sam', done);
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

    it('sends a file with callback', function(done) {
        request
            .get('/file-alt')
            .expect('file', done);
    });

    it("sendFile fails when file doesn't exist", function(done) {
        request
            .get('/file404')
            .expect(/ENOENT.*file404\.txt/, done);
    });

    it('downloads a file', function(done) {
        request
            .get('/download')
            .expect('Content-Disposition', 'attachment; filename="file123.txt"')
            .expect('file', done);
    });

    it('downloads a file, alternate', function(done) {
        request
            .get('/download-alt')
            .expect('Content-Disposition', 'attachment; filename="file.txt"')
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

    it('sets location with "back"', function(done) {
        request
            .get('/location-back')
            .expect('Location', '/')
            .expect('', done);
    });

    it('sets location with "back" and Referrer', function(done) {
        request
            .get('/location-back')
            .set('Referrer', '/test')
            .expect('Location', '/test')
            .expect('', done);
    });

    it('sets a cookie', function(done) {
        request
            .get('/cookie/bob')
            .expect('Set-Cookie', 'name=bob; Path=/')
            .expect('Set a cookie', done);
    });

    it('sets a signed cookie', function(done) {
        var signed = 's:' + sign('bob', 'Secret Cookie Signature');
        request
            .get('/signed-cookie/bob')
            .expect('Set-Cookie', cookie.serialize('name', signed)
                + '; Path=/')
            .expect('Set a signed cookie', done);
    });

    it('clears a cookie', function(done) {
        request
            .get('/clear-cookie')
            .expect('Set-Cookie', 'name=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
            .expect('Cleared cookie', done);
    });

    it('has a default error handler', function(done) {
        request
            .get('/error-pass')
            .expect(500, 'An error has occurred. '
                + 'Either there are no error handlers, '
                + 'or the associated error handler(s) '
                + 'also threw error(s).', done);
    });
});
