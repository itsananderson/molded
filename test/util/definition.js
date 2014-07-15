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
    it('exists', function() {
        assert(definition);
    });

    it('is a function ', function() {
        assert(typeof definition === 'function');
    });

    it('accepts a custom method and route', function() {
        testMethodAndRoute(definition.provider, 'foo', noop);
    });

    it('only sets deps/resolve if func exists', function() {
        var withoutFunc = definition('ALL', /.*/, 'foo', undefined, 123);
        assert(undefined === withoutFunc.deps);
        assert(undefined === withoutFunc.func);
    });

    it('only sets value if it exists', function() {
        var withoutVal = definition('ALL', /.*/, 'foo', noop);

        assert(undefined === withoutVal.value);
    });

    it('only sets singleton if it exists', function() {
        var withoutSingleton = definition('ALL', /.*/, 'foo', noop);
        assert(undefined === withoutSingleton.singleton);

        var withSingleton = definition('ALL', /.*/, 'foo', noop, undefined, true);
        assert(true === withSingleton.singleton);
    });

    describe('.provider()', function() {
        it('exists', function() {
            assert(definition.provider);
        });
    });

    describe('.singleton()', function() {
        it('exists', function() {
            assert(definition.singleton);
        });

        it('sets a singleton boolean to true', function() {
            var def = definition.singleton('ALL', /.*/, 'foo', noop);
            assert(def.singleton);
        });
    });

    describe('.value()', function() {
        it('exists', function() {
            assert(definition.value);
        });

        it('sets a value property', function() {
            var def = definition.value('ALL', /.*/, 'foo', 123);
            assert.equal(def.value, 123);
        });
    });

    describe('.error()', function() {
        it('exists', function() {
            assert(definition.error);
        });
    });

    describe('.initial()', function() {
        it('exists', function() {
            assert(definition.initial);
        });
        it('sets a value property', function() {
            var def = definition.initial('ALL', /.*/, 'foo', 123);
            assert.equal(def.value, 123);
        });
    });
});
