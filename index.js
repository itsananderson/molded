"use strict";

var p2r = require('path-to-regexp'),
    funcDeps = require('func-deps'),
    _ = require('lodash'),
    http = require('http'),
    util = require('util');


function RestInjector() {
    if (typeof this === 'undefined') {
        return new RestInjector();
    }
    this.providers = [];
    this.singletons = [];
    this.values = [];
    this.handlers = [];
}

function send(status, content) {
    var args = Array.prototype.slice.apply(arguments);
    if (typeof status === 'number') {
        this.statusCode = args.shift();
    } else {
        content = status;
    }
    if (typeof content === 'object') {
        if (!this.headersSent && undefined === this.getHeader('content-type')) {
            this.setHeader('Content-Type', 'application/json');
        }
        this.write(JSON.stringify(content));
        this.end();
    } else {
        this.write.apply(this, args);
        this.end();
    }
}

function initialDep(name, value) {
    return {
        method: 'ALL',
        route: /.*/,
        name: name,
        deps: [],
        provide: function() { return value }
    }
};

function initialDeps(req, res, next) {
    return [
        initialDep('req', req),
        initialDep('res', res),
        initialDep('next', next)
    ];
}

RestInjector.prototype.resolveDeps = function resolveDeps(deps, req, res, next) {
    var possibleDeps = initialDeps(req, res, next).concat(this.providers);
    var resolvedDeps = [];
    _.forEach(deps, function(dep, index) {
        var found = _.find(possibleDeps, function(possibleDep) {
            if ('ALL' !== possibleDep.method && possibleDep.method !== req.method) {
                return false;
            }
            return possibleDep.name == dep
                && null !== possibleDep.route.exec(req.url);
        });
        if (found) {
            resolvedDeps.push(found.provide(req, res));
        } else {
            throw Error('Unresolved dependency ' + dep);
        }
    });
    return resolvedDeps;
};

RestInjector.prototype.handleRequest = function handleRequest(req, res) {
    var self = this;
    res.send = send.bind(res);
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
            var keys = _.pluck(handler.keys, 'name');
            var routeParams = handler.route.exec(req.url).slice(1);
            if (keys.length > 0) {
                req.params = _.zipObject(keys, routeParams);
            } else {
                req.params = routeParams;
            }
            var depValues = self.resolveDeps(handler.deps, req, res, next);
            handler.handleRequest.apply(null, depValues);
        } else {
            res.statusCode = 404;
            res.write(util.format("Can't %s %s", req.method, req.url)); 
            res.end();
        }
    }
    next();
};

function addHandler(method, route, handleRequest) {
    if (_.isFunction(route) || _.isArray(route)) {
        handleRequest = route;
        route = /.*/;
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
    this.providers.push({
        method: 'ALL',
        route: /.*/,
        name: depName,
        deps: [],
        provide: provider
    });
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

RestInjector.prototype.use = function() {
    var args = ['ALL'].concat(Array.prototype.slice.apply(arguments));
    addHandler.apply(this, args);
};

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
