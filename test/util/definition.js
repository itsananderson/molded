var p2r = require('path-to-regexp');
var assert = require('assert');
var definition = require('../../lib/util/definition');

var noop = function() {};

var fooKeys = [];
var fooRegex = p2r('/:foo', fooKeys);
function testMethodAndRoute(type) {
    var args = ['PUT', '/:foo']
        .concat(Array.prototype.slice.call(arguments, 1));
    def = type.apply(definition, args);
    assert.equal(def.method, 'PUT');
    assert.deepEqual(def.keys, fooKeys);
    assert.equal(def.route.toString(), fooRegex.toString());
    return def;
}

describe('definition', function() {
    describe('provider()', function() {
        it('exists', function() {
            assert(definition.provider);
        });

        it('accepts a custom method and route', function() {
            testMethodAndRoute(definition.provider, 'foo', noop);
        });
    });

    describe('singleton()', function() {
        it('exists', function() {
            assert(definition.singleton);
        });

        it('accepts a custom method and route', function() {
            testMethodAndRoute(definition.singleton, 'foo', noop);
        });

        it('sets a singleton boolean to true', function() {
            var def = definition.singleton('ALL', /.*/, 'foo', noop);
            assert(def.singleton);
        });
    });

    describe('value()', function() {
        it('exists', function() {
            assert(definition.value);
        });

        it('accepts a custom method and route', function() {
            testMethodAndRoute(definition.value, 'foo', noop);
        });
    });

    describe('error()', function() {
        it('exists', function() {
            assert(definition.error);
        });
        it('accepts a custom method and route', function() {
            testMethodAndRoute(definition.error, 'foo', noop);
        });
    });

    describe('initial()', function() {
        it('exists', function() {
            assert(definition.initial);
        });
        it('accepts a custom method and route', function() {
            testMethodAndRoute(definition.initial, 'foo', noop);
        });
    });
});
