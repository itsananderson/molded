"use strict";

var p2r = require('path-to-regexp'),
    funcDeps = require('func-deps'),
    _ = require('lodash'),
    http = require('http'),
    util = require('util');

function Molded() {
    if (typeof this === 'undefined') {
        return new Molded();
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
    if (typeof content === 'string') {
        if (!this.headersSent && undefined === this.getHeader('content-type')) {
            this.setHeader('Content-Type', 'text/html');
        }
        this.write(content);
        this.end();
    } else if (Buffer.isBuffer(content)) {
        this.write(content);
        this.end();
    } else if (undefined === content) {
        this.end('undefined');
    } else {
        if (!this.headersSent && undefined === this.getHeader('content-type')) {
            this.setHeader('Content-Type', 'application/json');
        }
        this.write(JSON.stringify(content));
        this.end();
    }
}

function initialDep(name, value) {
    return {
        method: 'ALL',
        route: /.*/,
        name: name,
        deps: [],
        resolve: function() { return value }
    }
};

function initialDeps(req, res, next) {
    return [
        initialDep('req', req),
        initialDep('res', res),
        initialDep('next', next)
    ];
}

Molded.prototype.resolveDeps = function resolveDeps(req, initialDeps, depNames) {
    var self = this;
    var possibleDeps = initialDeps.concat(this.providers);
    var resolvedDeps = [];
    _.forEach(depNames, function(dep, index) {
        var found = _.find(possibleDeps, function(possibleDep) {
            if ('ALL' !== possibleDep.method && possibleDep.method !== req.method) {
                return false;
            }
            return possibleDep.name == dep
                && null !== possibleDep.route.exec(req.url);
        });
        if (found) {
            resolvedDeps.push(self.resolveAndCall(req, initialDeps, found));
        } else {
            console.log(dep);
            throw Error('Unresolved dependency: ' + dep);
        }
    });
    return resolvedDeps;
};

Molded.prototype.resolveAndCall = function resolveAndCall(req, initialDeps, callback) {
    var resolvedDeps = this.resolveDeps(req, initialDeps, callback.deps); 
    return callback.resolve.apply(null, resolvedDeps);
};

Molded.prototype.handleRequest = function handleRequest(req, res) {
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
            self.resolveAndCall(req, initialDeps(req, res, next), handler);
        } else {
            res.statusCode = 404;
            res.write(util.format("Can't %s %s", req.method, req.url)); 
            res.end();
        }
    }
    next();
};

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

Molded.prototype.provide = function provide(depName, provider) {
    var deps = funcDeps(provider);
    this.providers.push({
        method: 'ALL',
        route: /.*/,
        name: depName,
        deps: deps.deps,
        resolve: deps.func
    });
};

Molded.prototype.singleton = function singleton(depName, func) {
    this.singletons[depName] = func;
};

Molded.prototype.value = function value(depName, val) {
    if (val) {
        this.values[depName] = val;
    } else {
        return this.values[depName];
    }
};

Molded.prototype.use = function() {
    var args = ['ALL'].concat(Array.prototype.slice.apply(arguments));
    addHandler.apply(this, args);
};

var methods = ['get', 'post', 'put', 'patch', 'delete', 'copy',
               'head', 'options', 'link', 'unlink', 'purge', 'all'];

_.forEach(methods, function(method) {
    var methodUpper = method.toUpperCase();
    Molded.prototype[method] = function() {
        var args = [methodUpper].concat(Array.prototype.slice.apply(arguments));
        addHandler.apply(this, args);
    };
});

Molded.prototype.listen = function listen(port, cb) {
    http.createServer(this.handleRequest.bind(this)).listen(port);
};

module.exports = Molded;
