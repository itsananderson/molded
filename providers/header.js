var mime = require('mime');

function header(field, val) {
    if (arguments.length === 2) {
        if (Array.isArray(val)) val = val.map(String);
        else val = String(val);
        if ('content-type' == field.toLowerCase() && !/;\s*charset\s*=/.test(val)) {
            var charset = mime.charsets.lookup(val.split(';')[0]);
            if (charset) val += '; charset=' + charset.toLowerCase();
        }
        this.setHeader(field, val);
    } else if ('string' === typeof field) {
        return this.getHeader(field);
    } else {
        for (var key in field) {
            header.call(this, key, field[key]);
        }
    }
    return this;
};

module.exports = function() {
    return function(res) {
        return header.bind(res);
    };
};
