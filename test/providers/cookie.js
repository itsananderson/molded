var assert = require('assert');
var _cookie = require('cookie');
var cookieProvider = require('../../providers/cookie')();
cookieProvider = cookieProvider[cookieProvider.length-1];

function noop() {};

describe('cookie', function() {
    it('throws if signed with no secret', function(done) {
        var cookie = cookieProvider(null, {}, null, noop);

        try {
            cookie('name', 'value', {signed:true});
            assert(false, 'should have thrown');
        } catch (e) {
            done();
        }
    });

    it('stringifies numbers', function(done) {
        var checkCookie = function(name, value) {
            if (!value) {
                return undefined;
            }
            assert.equal(name, 'Set-Cookie');
            assert.equal(value, 'foo=3; Path=/');
            done();
        };
        var cookie = cookieProvider(null, {}, null, checkCookie);
        cookie('foo', 3);
    });

    it('stringifies objects', function(done) {
        var checkCookie = function(name, value) {
            if (!value) {
                return undefined;
            }
            assert.equal(name, 'Set-Cookie');
            assert.equal(value, _cookie.serialize('foo', 'j:{"hello":"world"}') + '; Path=/');
            done();
        };
        var cookie = cookieProvider(null, {}, null, checkCookie);
        cookie('foo', {hello: "world"});
    });

    it('sets maxAge', function(done) {
        var checkCookie = function(name, value) {
            if (!value) {
                return undefined;
            }
            assert.equal(name, 'Set-Cookie');
            var expires = new Date(value.match(/Expires=(.*)/)[1]);
            var lower = new Date(Date.now()
                + (1000 * 60 * 60) - (1000 * 5));
            var upper = new Date(Date.now()
                + (1000 * 60 * 60) + (1000 * 5));

            // Check that cookie expiration is within 10 seconds of expectation
            assert(lower < expires || upper > expires,
                'Cookie expiration not within expected range');
            done();
        }
        var options = {maxAge: 1000};
        var cookie = cookieProvider(null, {}, null, checkCookie);
        cookie('foo', 'bar', options);
    });

    it('handles one existing header', function(done) {
        var checkCookie = function(name, value) {
            if (!value) {
                return 'foo=3; Path=/';
            }
            assert.equal(value.length, 2);
            assert.equal(value[0], 'foo=3; Path=/');
            assert.equal(value[1], 'foo=bar; Path=/');
            done();
        };
        var cookie = cookieProvider(null, {}, null, checkCookie);
        cookie('foo', 'bar');
    });

    it('handles multiple existing header', function(done) {
        var checkCookie = function(name, value) {
            if (!value) {
                return ['foo=3; Path=/', 'foo=bar; Path=/'];
            }
            assert.equal(value.length, 3);
            assert.equal(value[0], 'foo=3; Path=/');
            assert.equal(value[1], 'foo=bar; Path=/');
            assert.equal(value[2], 'foo=bing; Path=/');
            done();
        };
        var cookie = cookieProvider(null, {}, null, checkCookie);
        cookie('foo', 'bing');
    });
});
