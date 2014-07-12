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

function Injector() {
    this.providers = [];
    this.singletons = [];
    this.values = [];
    this.handlers = [];
}

Injector.prototype.handleRequest = function handleRequest(req, res) {
    res.send = send;
    var index = 0;
    var handlers = _.clone(this.handlers);
    function next() {
        if (index < handlers.length) {
            var handler = handlers[index++];
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

function handler(method) {
    return function(route, handleRequest) {
        if (typeof route === 'function') {
            handleRequest = route;
            route = '*';
        }
        var keys = [];
        var route = p2r(route, keys);
        this.handlers.push({
            method: method,
            keys: keys,
            route: route,
            handleRequest: handleRequest
        });
    };
}

Injector.prototype.provide = function provide(depName, provider) {
    this.providers[depName] = provider;
};

Injector.prototype.singleton = function singleton(depName, func) {
    this.singletons[depName] = func;
};

Injector.prototype.value = function value(depName, val) {
    if (val) {
        this.values[depName] = val;
    } else {
        return this.values[depName];
    }
};

Injector.prototype.use = handler('ALL');

var methods = ['get', 'post', 'put', 'patch', 'delete', 'copy',
               'head', 'options', 'link', 'unlink', 'purge', 'all'];

_.forEach(methods, function(method) {
    Injector.prototype[method] = handler(method.toUpperCase());
});

Injector.prototype.listen = function listen(port, cb) {
    http.createServer(this.handleRequest.bind(this)).listen(port);
};

module.exports = function() {
    return new Injector();
};
