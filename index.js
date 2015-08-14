"use strict";

var express = require("express");

function createApplication() {
    var app = express();

    app.provide = function() {
    };

    return app;
}

module.exports = createApplication;
