"use strict";

var q = require('q'),
    _ = require('lodash'),
    util = require('util'),
    mixin = require('utils-merge'),
    EventEmitter = require('events').EventEmitter;

var appProto = require('./lib/application'),
    coreProviders = require('./lib/providers'),
    definition = require('./lib/definition');

function createApplication() {
    function app(req, res) {
        app.handleRequest(req, res);
    }

    mixin(app, appProto);
    mixin(app, EventEmitter.prototype);

    app.providers = coreProviders;
    app.singletons = [];
    app.values = [];
    app.handlers = [];
    app.errorHandlers = [];

    return app;
}

module.exports = createApplication;
