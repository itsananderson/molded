"use strict";

var mixin = require('utils-merge'),
    EventEmitter = require('events').EventEmitter,
    express = require("express");

var proto = require('./lib/application'),
    coreProviders = require('./lib/providers');

function createApplication() {
    var app = express();

    app.provide = function() {
    };

    return app;
}

module.exports = createApplication;
