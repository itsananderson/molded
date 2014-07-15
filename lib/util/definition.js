var p2r = require('path-to-regexp');
var funcDeps = require('func-deps');

function definition(method, route, name, func, value, singleton) {
    var keys = [];
    var route = p2r(route, keys);
    var def = {
        method: method,
        keys: keys,
        route: route,
        name: name
    };

    if (func) {
        var deps = funcDeps(func);
        def.deps = deps.deps;
        def.resolve = deps.func;
    }
    if (value) {
        def.value = value;
    }
    if (singleton) {
        def.singleton = singleton;
    }
    return def;
}

function providerDefinition(method, route, name, func) {
    return definition(method, route, name, func);
};

function singletonDefinition(method, route, name, func) {
    return definition(method, route, name, func, undefined, true);
}

function valueDefinition(method, route, name, value) {
    return definition(method, route, name, undefined, value);
}

function errorDefinition(method, route, name, func) {
    return definition(method, route, name, func);
}

function initialDefinition(method, route, name, value) {
    return definition(method, route, name, undefined, value);
}

module.exports = {
    provider: providerDefinition,
    singleton: singletonDefinition,
    value: valueDefinition,
    error: errorDefinition,
    initial: initialDefinition
};
