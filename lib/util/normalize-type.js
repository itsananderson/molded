var mime = require('mime');
var acceptParams = require('./accept-params');

module.exports = function normalizeType(type){
    return ~type.indexOf('/')
        ? acceptParams(type)
        : { value: mime.lookup(type), params: {} };
};
