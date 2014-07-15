var _ = require('lodash');
var funcDeps = require('func-deps');
var p2r = require('path-to-regexp');

function addHandler(method, route, handler) {
    if (_.isFunction(route) || _.isArray(route)) {
        handler = route;
        route = /.*/;
    }
    var keys = [];
    var route = p2r(route, keys);
    var deps = funcDeps(handler);
    this.handlers.push({
        method: method,
        keys: keys,
        route: route,
        resolve: deps.func,
        deps: deps.deps
    });
}

module.exports = addHandler;
