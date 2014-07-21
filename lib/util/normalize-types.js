var normalizeType = require('./normalize-type');

module.exports = function normalizeTypes(types){
    var ret = [];

    for (var i = 0; i < types.length; ++i) {
        ret.push(normalizeType(types[i]));
    }

    return ret;
};
