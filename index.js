"use strict";

var q = require('q'),
    _ = require('lodash'),
    util = require('util'),
    mixin = require('utils-merge'),
    EventEmitter = require('events').EventEmitter;

var appProto = require('./lib/application'),
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

var coreProviderNames = [
    'send-json', 'send',
    'accepts', 'accepts-encodings', 'accepts-charsets', 'accepts-languages',
    'range', 'type-is'];
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
        definition.provider('ALL', /.*/, injectionName, provider()));
});

module.exports = createApplication;
