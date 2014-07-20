var assert = require('assert');
var acceptParams = require('../../lib/util/accept-params');

var header1 = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';

var header2 = 'text/html;foo=bar;p=0.9';

var types = [
    {
        value: 'text/html',
        expected: {
            value: 'text/html',
            quality: 1,
            params: {},
            originalIndex: undefined
        }
    },
    {
        value: 'text/html;q=0.8',
        expected: {
            value: 'text/html',
            quality: 0.8,
            params: {},
            originalIndex: undefined
        }
    },
    {
        value: 'text/html;foo=bar;q=0.8',
        expected: {
            value: 'text/html',
            quality: 0.8,
            params: {foo:"bar"},
            originalIndex: undefined
        }
    }
];

function testType(i) {
    var type = types[i];
    var result = acceptParams(type.value);
    assert.deepEqual(result, type.expected);
}

describe('acceptParams', function() {
    it('handles no params', function() {
        testType(0);
    });
    it('handles params', function() {
        testType(1);
    });
    it('handles multiple params', function() {
        testType(2);
    });
});
