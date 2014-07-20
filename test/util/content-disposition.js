var assert = require('assert');
var contentDisposition = require('../../lib/util/content-disposition');

describe('contentDisposition', function() {
    it('returns attachment for no file name', function() {
        assert.equal(contentDisposition(), 'attachment');
    });
    it('returns file name', function() {
        assert.equal(contentDisposition('test.txt'),
            'attachment; filename="test.txt"');
    });
    it('returns utf-8 encoded for non-ASCII files', function() {
        var file = 'fañcy.txt';
        assert.equal(contentDisposition(file),
            'attachment; filename="' + encodeURI(file) +'";'
            + ' filename*=UTF-8\'\'' + encodeURI(file));
    });
});
