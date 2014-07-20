var assert = require('assert');
var normalizeType = require('../../lib/util/normalize-type');

describe('normalizeType', function() {
    it('works with full content types', function() {
        var expected = {
            value: 'index/html',
            quality: 1,
            params: {},
            originalIndex: undefined
        };
        assert.deepEqual(normalizeType('index/html'), expected);
    });
    it('works with short', function() {
        var expected = {
            value: 'text/html',
            params: {}
        };
        assert.deepEqual(normalizeType('html'), expected);
    });
});
