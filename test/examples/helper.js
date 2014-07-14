"use strict";
var assert = require('assert');
var http = require('http');
 
function ExampleTestHelper(host, port) {
    if (typeof this == 'undefined') {
        return new ExampleTestHelper(host, port);
    }
    this.host = host;
    this.port = port;
    this.base = 'http://' + host + ':' + port;
};

ExampleTestHelper.prototype.getResponse = function getResponse(url, cb) {
    var url = ('string' === typeof url ? this.base + url : url);
    http.get(url, function(res) {
        var responseString = '';
        res.on('data', function(data) {
            responseString += data.toString();
        });
        res.on('end', function() {
            cb(null, responseString, res);
        });
    });
}

ExampleTestHelper.prototype.expectGetResponse = function expectGetResponse(url, expectedResponse, cb) {
    this.getResponse(url, function(err, response, res) {
        if (typeof expectedResponse === 'string') {
            assert.equal(response, expectedResponse);
        } else if (typeof expectedResponse === 'function') {
            expectedResponse(response)
        } else if (Object.prototype.toString.call(expectedResponse) === '[object RegExp]') {
            assert.ok(expectedResponse.test(response));
        } else {
            assert.equal(response, JSON.stringify(expectedResponse));
        }
        cb(null, response, res);
    });
};

ExampleTestHelper.prototype.expectJson = function expectJson(url, object, cb) {
    this.expectGetResponse(url, object,
        function(err, response, res) {
            assert.equal(res.headers['content-type'], 'application/json');
            cb(err, response, res);
        });
};

ExampleTestHelper.prototype.postJson = function postJson(url, object, expectedResponse, cb) {
    var opts = 'string' === typeof url ? {
        host: this.host,
        port: this.port,
        path: url,
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    } : url;
    var req = http.request(opts, function(res) {
        var responseString = '';
        res.on('data', function(data) {
            responseString += data.toString();
        });
        res.on('end', function() {
            if ('object' === typeof expectedResponse) {
                assert.equal(responseString, JSON.stringify(expectedResponse));
            } else if ('function' === typeof expectedResponse) {
                expectedResponse(responseString);
            } else {
                assert.equal(responseString, expectedResponse);
            }
            cb(null, responseString, res);
        });
    });

    req.write(JSON.stringify(object));
    req.end();
};

module.exports = ExampleTestHelper;
