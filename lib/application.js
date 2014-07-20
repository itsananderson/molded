var _ = require('lodash'),
    http = require('http'),
    q = require('q'),
    util = require('util');

var addHandler = require('./util/add-handler'),
    definition = require('./util/definition'),
    initialDeps = require('./util/initial-deps'),
    methodMatches = require('./util/method-matches'),
    routeParams = require('./util/route-params');

var app = exports = module.exports = {};

app.resolveDeps = function resolveDeps(method, url, params, initialDeps, depNames) {
    var self = this;
    var possibleDeps = []
        .concat(initialDeps)
        .concat(this.values)
        .concat(this.singletons)
        .concat(this.providers);

    var nextRoute = _.find(initialDeps, function(dep) {
        return dep.name === 'next';
    }).value;

    var calledNext = false;
    var initialDeps = initialDeps.filter(function(dep) {
        return dep.name !== 'next';
    });
    initialDeps.push(definition.initial('ALL', /.*/, 'next', function next(err) {
        calledNext = true;
        nextRoute(err);
    }));

    var resolvedDeps = [];
    _.forEach(depNames, function(dep, index) {
        if (calledNext) {
            return false;
        }
        if ('params' === dep) {
            resolvedDeps.push(params);
            return;
        }
        var optional = false;
        if ('_' === dep[dep.length-1]) {
            optional = true;
            dep = dep.substring(0, dep.length-1);
        }
        var found = _.find(possibleDeps, function(possibleDep) {
            if (!methodMatches(method, possibleDep.method)) {
                return false;
            }
            return possibleDep.name == dep
                && null !== possibleDep.route.exec(url);
        });
        if (found) {
            var depParams = routeParams(found.route, url, found.keys);
            if (found.value) {
                resolvedDeps.push(found.value);
            } else if (found.singleton) {
                // If singleton, call and cache value
                resolvedDeps.push(found.value = self.resolveAndCall(method, url, depParams, initialDeps, found));
            } else {
                resolvedDeps.push(self.resolveAndCall(method, url, depParams, initialDeps, found));
            }
        } else {
            if(optional) {
                resolvedDeps.push(undefined);
            } else {
                resolvedDeps.push(q.fcall(function() {
                    throw Error('Unresolved dependency: ' + dep);
                }));
                return false;
            }
        }
    });
    return q.all(resolvedDeps)
        .then(function(resolved) {
            if (calledNext) {
                return false;
            }
            return resolved;
        });
};

app.resolveAndCall = function resolveAndCall(method, url, params, initialDeps, callback) {
    var depsPromise = this.resolveDeps(method, url, params,initialDeps, callback.deps);
    return depsPromise.then(function(resolvedDeps) {
        if (resolvedDeps) {
            return callback.resolve.apply(null, resolvedDeps)
        } else {
            return false;
        }
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
                var params = routeParams(handler.route, req.url, handler.keys);
                var deps = initialDeps(req, res, next);
                self.resolveAndCall(req.method, req.url, params, deps, handler)
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
            var params = routeParams(handler.route, req.url, handler.keys);
            self.resolveAndCall(req.method, req.url, params, initialDeps(req, res, next, err), handler).catch(function(err) {
                next(err);
            });
        } else {
            console.error(err);
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

app.provide = function provide(route, depName, provider) {
    if (_.isFunction(depName)) {
        provider = depName;
        depName = route;
        route = /.*/;
    }
    this.providers.push(definition.provider('ALL', route, depName, provider));
};

app.singleton = function singleton(depName, func) {
    this.singletons.push(definition.singleton('ALL', /.*/, depName, func));
};

app.value = function value(depName, val) {
    if (val) {
        this.values.push(definition.value('ALL', /.*/, depName, val));
    } else {
        var found = _.find(this.values, function(value) {
            return value.name === depName
        });
        return undefined === found ? undefined : found.value;
    }
};

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
