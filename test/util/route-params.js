var assert = require('assert');
var p2r = require('path-to-regexp');
var routeParams = require('../../lib/util/route-params');

describe('routeParams', function() {
    it('works with named keys', function() {
        var keys = [];
        var route = p2r('/:user/:friend', keys);
        var result = routeParams(route, '/bob/alice', keys);
        assert.deepEqual(result, {user:'bob',friend:'alice'});
    });

    it('works with raw key names', function() {
        var route = p2r('/:user/:friend');
        var result = routeParams(route, '/bob/alice', ['user','friend']);
        assert.deepEqual(result, {user:'bob',friend:'alice'});
    });

    it('returns null for no match', function() {
        var result = routeParams(/nomatch/, '/');
        assert.equal(result, null);
    });

    it('works with unnamed params', function() {
        var result = routeParams(/\/(.*)/, '/asdf', []);
        assert.deepEqual(result, ['asdf']);
    });

    it('works with named params and undefined keys', function() {
        var route = p2r('/:user/:friend');
        var result = routeParams(route, '/bob/alice');
        assert.deepEqual(result, ['bob','alice']);
    });

    it('works with undefined keys', function() {
        var result = routeParams(/\/(.*)/, '/asdf');
        assert.deepEqual(result, ['asdf']);
    });
});
