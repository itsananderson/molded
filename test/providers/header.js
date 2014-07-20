var assert = require('assert');
var headerProvider = require('../../providers/header')();

function ResMock() {
    this.headers = {};
    this.setHeader = function(name, val) {
        if (Array.isArray(val)) {
            return val.map(this.setHeader.bind(this, name));
        }
        if (this.headers[name]) {
            this.headers[name].push(val);
        } else {
            this.headers[name] = [val];
        }
    };
    this.getHeader = function(name) {
        return this.headers[name];
    }
}

describe('header', function() {
    it('accepts multiple values', function() {
        var res = new ResMock();
        var header = headerProvider(res);
        header('names', ['bob', 'joe']);
        assert.deepEqual(res.headers['names'], ['bob', 'joe']);
    });

    it('returns a header', function() {
        var res = new ResMock();
        var header = headerProvider(res);
        header('names', ['bob', 'joe']);
        var headers = header('names');
        assert.deepEqual(headers, ['bob', 'joe']);
    });

    it('sets multiple headers', function() {
        var res = new ResMock();
        var header = headerProvider(res);
        header({'names': ['bob', 'joe']});
        assert.deepEqual(res.headers, {'names':['bob', 'joe']});
    });
});
