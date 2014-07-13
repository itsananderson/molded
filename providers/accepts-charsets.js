var accepts = require('accepts');

module.exports = function() {
    return function(req) {
        return function() {
            var accept = accepts(req);
            return accept.charsets.apply(accept, arguments);
        };
    };
};
