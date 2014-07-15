var assert = require('assert');
var definition = require('../../lib/util/definition');

describe('definition', function() {
    describe('provider()', function() {
        it('exists', function() {
            assert(definition.provider);
        });
    });

    describe('singleton()', function() {
        it('exists', function() {
            assert(definition.singleton);
        });
    });

    describe('value()', function() {
        it('exists', function() {
            assert(definition.value);
        });
    });

    describe('error()', function() {
        it('exists', function() {
            assert(definition.error);
        });
    });

    describe('initial()', function() {
        it('exists', function() {
            assert(definition.initial);
        });
    });
});
