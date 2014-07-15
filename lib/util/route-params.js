var _ = require('lodash');

function routeParams(route, url, keys) {
    var keys = _.map(keys || [], function(key) {
        if ('string' === typeof key) {
            return key;
        } else {
            return key.name;
        }
    });
    var params = params = route.exec(url);
    if (null === params) {
        return null;
    }
    params = Array.prototype.slice.call(params, 1);
    if (keys.length > 0) {
        return _.zipObject(keys, params);
    } else {
        return params;
    }
}

module.exports = routeParams;
