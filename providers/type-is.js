var typeis = require('type-is');

function typeIs(types) {
    if (!Array.isArray(types)) types = [].slice.call(arguments);
    return typeis(this, types);
};

module.exports = function() {
    return function(req) {
        return typeIs.bind(req);
    };
};
