"use strict";

var p2r = require('path-to-regexp'),
    funcDeps = require('func-deps'),
    _ = require('lodash'),
    http = require('http'),
    util = require('util');

function send(status, content) {
    var args = Array.prototype.slice.apply(arguments);
    if (typeof status === 'number') {
        req.status = args.shift();
    } else {
        content = status;
    }
    res.write.apply(res, arguments);
    res.end();
}

function RestInjector() {
    if (typeof this === 'undefined') {
        return new RestInjector();
    }
    this.providers = [];
    this.singletons = [];
    this.values = [];
    this.handlers = [];
}

RestInjector.prototype.handleRequest = function handleRequest(req, res) {
    res.send = send;
    var handlers = _.clone(this.handlers);
    function next() {
        if (handlers.length > 0) {
            var handler = handlers.shift();
            if ('ALL' !== handler.method && handler.method !== req.method) {
                return next();
            }
            var params = handler.route.exec(req.url);
            if (null === params) {
                return next();
            }
            req.params = _.zipObject(_.pluck(handler.keys, 'name'),
                handler.route.exec(req.url).slice(1));
            handler.handleRequest(req, res, next);
        } else {
            res.write(util.format("Can't %s %s", req.method, req.url)); 
            res.end();
        }
    }
    next();
};

function addHandler(method, route, handleRequest) {
    if (_.isFunction(route) || _.isArray(route)) {
        handleRequest = route;
        route = '*';
    }
    var keys = [];
    var route = p2r(route, keys);
    var deps = funcDeps(handleRequest);
    this.handlers.push({
        method: method,
        keys: keys,
        route: route,
        handleRequest: deps.func,
        deps: deps.deps
    });
}

RestInjector.prototype.provide = function provide(depName, provider) {
    this.providers[depName] = provider;
};

RestInjector.prototype.singleton = function singleton(depName, func) {
    this.singletons[depName] = func;
};

RestInjector.prototype.value = function value(depName, val) {
    if (val) {
        this.values[depName] = val;
    } else {
        return this.values[depName];
    }
};

RestInjector.prototype.use = addHandler.bind(null, 'ALL');

var methods = ['get', 'post', 'put', 'patch', 'delete', 'copy',
               'head', 'options', 'link', 'unlink', 'purge', 'all'];

_.forEach(methods, function(method) {
    var methodUpper = method.toUpperCase();
    RestInjector.prototype[method] = function() {
        var args = [methodUpper].concat(Array.prototype.slice.apply(arguments));
        addHandler.apply(this, args);
    };
});

RestInjector.prototype.listen = function listen(port, cb) {
    http.createServer(this.handleRequest.bind(this)).listen(port);
};

module.exports = RestInjector;
