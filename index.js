"use strict";

var p2r = require('path-to-regexp'),
    funcDeps = require('func-deps'),
    q = require('q'),
    _ = require('lodash'),
    http = require('http'),
    util = require('util');

var coreProviderNames = [
    'send-json', 'send',
    'accepts', 'accepts-encodings', 'accepts-charsets'];
var coreProviders = [];

function dashToCamel(string) {
    return string.replace(/\W+(.)/g, function (x, chr) {
        return chr.toUpperCase();
    });
};

coreProviderNames.forEach(function(providerName) {
    var injectionName = dashToCamel(providerName);    
    var provider = require('./providers/' + providerName);
    coreProviders.push(
        getProviderDefinition('ALL', /.*/, injectionName, provider()));
});

function Molded() {
    if (typeof this === 'undefined') {
        return new Molded();
    }
    this.providers = coreProviders;
    this.singletons = [];
    this.values = [];
    this.handlers = [];
    this.errorHandlers = [];
}

function initialDep(name, value) {
    return {
        method: 'ALL',
        route: /.*/,
        name: name,
        value: value
    }
};

function initialDeps(req, res, next, err) {
    var deps = [
        initialDep('req', req),
        initialDep('res', res),
    ];
    if (next) {
        deps.push(initialDep('next', next));
    }
    if (err) {
        deps.push(initialDep('err', err));
    }
    return deps;
}

Molded.prototype.resolveDeps = function resolveDeps(method, url, initialDeps, depNames) {
    var self = this;
    var possibleDeps = []
        .concat(initialDeps)
        .concat(this.values)
        .concat(this.singletons)
        .concat(this.providers);

    var nextlessDeps = initialDeps.filter(function(dep) {
        return dep.name !== 'next';
    });
    var resolvedDeps = [];
    _.forEach(depNames, function(dep, index) {
        var found = _.find(possibleDeps, function(possibleDep) {
            if (!methodMatches(method, possibleDep.method)) {
                return false;
            }
            return possibleDep.name == dep
                && null !== possibleDep.route.exec(url);
        });
        if (found) {
            if (found.value) {
                resolvedDeps.push(found.value);
            } else {
                resolvedDeps.push(self.resolveAndCall(method, url, nextlessDeps, found));
            }
        } else {
            resolvedDeps.push(q.fcall(function() {
                throw Error('Unresolved dependency: ' + dep);
            }));
            return false;
        }
    });
    return q.all(resolvedDeps);
};

Molded.prototype.resolveAndCall = function resolveAndCall(method, url, initialDeps, callback) {
    var depsPromise = this.resolveDeps(method, url, initialDeps, callback.deps); 
    return depsPromise.then(function(resolvedDeps) {
        return callback.resolve.apply(null, resolvedDeps)
    });
};

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

function methodMatches(expected, actual) {
    return 'ALL' === actual || expected === actual;
}

Molded.prototype.handleRequest = function handleRequest(req, res) {
    var self = this;
    var handlers = _.clone(this.handlers);
    function next(err) {
        if (err) {
            self.handleError(req, res, err);
        } else {
            if (handlers.length > 0) {
                var handler = handlers.shift();
                if (!methodMatches(req.method, handler.method)) {
                    return next();
                }
                var params = handler.route.exec(req.url);
                if (null === params) {
                    return next();
                }
                req.params = routeParams(handler.route, req.url, handler.keys);
                var deps = initialDeps(req, res, next);
                self.resolveAndCall(req.method, req.url, deps, handler)
                    .catch(function(err) {
                        self.handleError(req, res, err)
                    });
            } else {
                res.statusCode = 404;
                res.write(util.format("Can't %s %s", req.method, req.url)); 
                res.end();
            }
        }
    }
    next();
};

Molded.prototype.handleError = function handleError(req, res, err) {
    var self = this;
    var errorHandlers = _.clone(this.errorHandlers);
    function next(err) {
        if (errorHandlers.length > 0) {
            var handler = errorHandlers.shift();
            if (!methodMatches(req.method, handler.method)) {
                return next(err);
            }
            var params = handler.route.exec(req.url);
            if (null === params) {
                return next(err);
            }
            req.params = routeParams(handler.route, req.url, handler.keys);
            self.resolveAndCall(req.method, req.url, initialDeps(req, res, next, err), handler).catch(function(err) {
                next(err);
            });
        } else {
            console.log(err);
            res.statusCode = 500;
            var message = 'An error has occurred. ' +
                'Either there are no error handlers, ' + 
                'or the associated error handler(s) also threw error(s).'
            res.end(message);
        }
    }
    next(err);
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

function getProviderDefinition(method, route, name, func) {
    var deps = funcDeps(func);
    return {
        method: 'ALL',
        route: /.*/,
        name: name,
        deps: deps.deps,
        resolve: deps.func
    };
};

Molded.prototype.provide = function provide(depName, provider) {
    this.providers.push(
        getProviderDefinition('ALL', /.*/, depName, provider));
};

Molded.prototype.singleton = function singleton(depName, func) {
    var deps = funcDeps(func);
    var single = {
        method: 'ALL',
        route: /.*/,
        name: depName,
        deps: deps.deps,
        resolve: deps.func
    };
    single.value = this.resolveAndCall('ALL', '/', [], single);
    this.singletons.push(single);
};

Molded.prototype.value = function value(depName, val) {
    if (val) {
        this.values.push({
            method: 'ALL',
            route: /.*/,
            name: depName,
            value: val
        });
    } else {
        var found = _.find(this.values, function(value) {
            return value.name === depName
        });
        return undefined === found ? undefined : found.value;
    }
};

Molded.prototype.error = function error(route, handler) {
    if (_.isFunction(route) || _.isArray(route)) {
        handler = route;
        route = /.*/;
    }
    var keys = [];
    var route = p2r(route, keys);
    var deps = funcDeps(handler);
    this.errorHandlers.push({
        method: 'ALL',
        keys: keys,
        route: route,
        resolve: deps.func,
        deps: deps.deps
    });
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
