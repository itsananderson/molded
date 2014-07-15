"use strict";

var mixin = require('utils-merge'),
    EventEmitter = require('events').EventEmitter;

var proto = require('./lib/application'),
    coreProviders = require('./lib/providers');

function createApplication() {
    function app(req, res) {
        app.handleRequest(req, res);
    }

    mixin(app, proto);
    mixin(app, EventEmitter.prototype);

    app.providers = coreProviders;
    app.singletons = [];
    app.values = [];
    app.handlers = [];
    app.errorHandlers = [];

    return app;
}

module.exports = createApplication;
