var assert = require('assert');
var clearCookie = require('../../providers/clear-cookie')();

describe('clearCookie', function() {
    it('accepts options', function(done) {
        var cookie = function(name, val, options) {
            assert.equal(options.path, '/foo')
            done();
        };
        clearCookie(null, cookie)('name', {path: '/foo'});
    });
});
