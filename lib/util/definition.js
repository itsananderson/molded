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

definition.provider = function providerDefinition(method, route, name, func) {
    return definition(method, route, name, func);
};

definition.singleton = function singletonDefinition(method, route, name, func) {
    return definition(method, route, name, func, undefined, true);
}

definition.value = function valueDefinition(method, route, name, value) {
    return definition(method, route, name, undefined, value);
}

definition.error = function errorDefinition(method, route, name, func) {
    return definition(method, route, name, func);
}

definition.initial = function initialDefinition(method, route, name, value) {
    return definition(method, route, name, undefined, value);
}

module.exports = definition; 
