var assert = require('assert');
var formatProvider = require('../../providers/format')();

var fakeVary = function() {};

var fakeAccepts = function(value) {
    return function() {
        return value;
    };
};

describe('format provider', function(done) {
    it('throws if no acceptable types', function(done) {
        var next = function(err) {
            assert.equal(err.message, 'Not Acceptable');
            done();
        };
        var format = formatProvider(null, null, next, fakeVary, fakeAccepts(undefined), fakeVary, null);
        format({
            'text/html' : function() {
                assert(false);
            }
        });
    });

    it('calls defaults there is no match', function(done) {
        var next = function(err) {
            done('error: should not have called next');
        };
        var format = formatProvider(null, null, next, fakeVary, fakeAccepts(undefined), fakeVary, null);
        format({
            'text/html' : function() {
                assert(false);
                done('Error: should not have called text/html');
            },
            'default' : function() {
                done();
            }
        });
    });
});
