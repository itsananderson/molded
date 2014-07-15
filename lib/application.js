var funcDeps = require('func-deps');
var p2r = require('path-to-regexp');
var q = require('q');
var _ = require('lodash');
var definition = require('./definition');
var http = require('http');

var app = exports = module.exports = {};

function initialDeps(req, res, next, err) {
    var deps = [
        definition.initial('ALL', /.*/, 'req', req),
        definition.initial('ALL', /.*/, 'res', res),
    ];
    if (next) {
        deps.push(definition.initial('ALL', /.*/, 'next', next));
    }
    if (err) {
        deps.push(definition.initial('ALL', /.*/, 'err', err));
    }
    return deps;
}

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


app.resolveDeps = function resolveDeps(method, url, initialDeps, depNames) {
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
            } else if (found.singleton) {
                // If singleton, call and cache value
                resolvedDeps.push(found.value = self.resolveAndCall(method, url, nextlessDeps, found));
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

app.resolveAndCall = function resolveAndCall(method, url, initialDeps, callback) {
    var depsPromise = this.resolveDeps(method, url, initialDeps, callback.deps); 
    return depsPromise.then(function(resolvedDeps) {
        return callback.resolve.apply(null, resolvedDeps)
    });
};

app.handleRequest = function handleRequest(req, res) {
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

app.handleError = function handleError(req, res, err) {
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

app.listen = function listen(){
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

app.error = function error(route, handler) {
    if (_.isFunction(route) || _.isArray(route)) {
        handler = route;
        route = /.*/;
    }
    this.errorHandlers.push(definition.error('ALL', route, null, handler));
};

app.provide = function provide(depName, provider) {
    this.providers.push(definition.provider('ALL', /.*/, depName, provider));
};

app.singleton = function singleton(depName, func) {
    this.singletons.push(definition.singleton('ALL', /.*/, depName, func));
};

app.value = function value(depName, val) {
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

app.use = function() {
    var args = ['ALL'].concat(Array.prototype.slice.call(arguments));
    addHandler.apply(this, args);
};

var methods = ['get', 'post', 'put', 'patch', 'delete', 'copy',
               'head', 'options', 'link', 'unlink', 'purge', 'all'];

_.forEach(methods, function(method) {
    var methodUpper = method.toUpperCase();
    app[method] = function() {
        var args = [methodUpper].concat(Array.prototype.slice.call(arguments));
        addHandler.apply(this, args);
    };
});
