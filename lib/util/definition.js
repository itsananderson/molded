var p2r = require('path-to-regexp');
var funcDeps = require('func-deps');

function providerDefinition(method, route, name, func) {
    var keys = [];
    var route = p2r(route, keys);
    var deps = funcDeps(func);
    return {
        method: method,
        keys: keys,
        route: route,
        name: name,
        deps: deps.deps,
        resolve: deps.func
    };
};

function singletonDefinition(method, route, name, func) {
    var keys = [];
    var route = p2r(route, keys);
    var deps = funcDeps(func);
    return {
        method: method,
        keys: keys,
        route: route,
        name: name,
        deps: deps.deps,
        resolve: deps.func,
        singleton: true
    };
}

function valueDefinition(method, route, name, value) {
    var keys = [];
    var route = p2r(route, keys);
    return {
        method: method,
        keys: keys,
        route: route,
        name: name,
        value: value
    }
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

function initialDefinition(method, route, name, value) {
    var keys = [];
    var route = p2r(route, keys);
    return {
        method: method,
        keys: keys,
        route: route,
        name: name,
        value: value
    }
}

module.exports = {
    provider: providerDefinition,
    singleton: singletonDefinition,
    value: valueDefinition,
    error: errorDefinition,
    initial: initialDefinition
};
