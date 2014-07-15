var p2r = require('path-to-regexp');
var funcDeps = require('func-deps');

function providerDefinition(method, route, name, func) {
    var deps = funcDeps(func);
    return {
        method: 'ALL',
        route: /.*/,
        name: name,
        deps: deps.deps,
        resolve: deps.func
    };
};

function singletonDefinition(method, route, name, func) {
    var deps = funcDeps(func);
    return {
        method: 'ALL',
        route: /.*/,
        name: name,
        deps: deps.deps,
        resolve: deps.func,
        singleton: true
    };
}

function errorDefinition(method, route, name, func) {
    var keys = [];
    var route = p2r(route, keys);
    var deps = funcDeps(func);
    return {
        method: method,
        keys: keys,
        route: route,
        name: name,
        resolve: deps.func,
        deps: deps.deps
    }
}

module.exports = {
    provider: providerDefinition,
    singleton: singletonDefinition,
    error: errorDefinition
};
