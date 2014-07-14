var assert = require('assert');
var http = require('http');
var providers = require('../../examples/providers');
var host = 'localhost';
var port = 3000;
var helper = require('./helper')(host, port);

describe('Providers', function() {
    before(function() {
        providers.listen(port);
    });

    it('exists', function() {
        assert(providers != undefined);
    });

    it('checks accept-language: en', function(done) {
        var opts = {
            host: host,
            port: port,
            path: '/languages',
            headers: { 'accept-language': 'en' }
        };
        helper.expectGetResponse(opts, 'In English', done);
    });

    it('checks accept-language: es', function(done) {
        var opts = {
            host: host,
            port: port,
            path: '/languages',
            headers: { 'accept-language': 'es' }
        };
        helper.expectGetResponse(opts, 'En Español', done);
    });

    it('checks range - single', function(done) {
        var opts = {
            host: host,
            port: port,
            path: '/range',
            headers: { 'range': 'bytes=0-100' }
        };
        var expRes = 'Range: "bytes"\n\tStart: 0,\tEnd: 100';
        helper.expectGetResponse(opts, expRes, done);
    });

    it('checks range - multiple', function(done) {
        var opts = {
            host: host,
            port: port,
            path: '/range',
            headers: { 'range': 'bytes=0-100,100-200' }
        };
        var expRes = 'Range: "bytes"\n\tStart: 0,\tEnd: 100' +
            '\n\tStart: 100,\tEnd: 200';
        helper.expectGetResponse(opts, expRes, done);
    });

    it('checks range - within limits', function(done) {
        var opts = {
            host: host,
            port: port,
            path: '/range',
            headers: { 'range': 'bytes=0-2000' }
        };
        var expRes = 'Range: "bytes"\n\tStart: 0,\tEnd: 1023';
        helper.expectGetResponse(opts, expRes, done);
    });

    it('checks content-type - valid', function(done) {
        var obj = { name: 'bob' };
        helper.postJson('/typeis', obj, 'Thanks for the JSON :)', done);
    });

    it('checks content-type - invalid', function(done) {
        var opts = {
            host: host,
            port: port,
            path: '/typeis',
            headers: {'content-type': 'text/plain'},
            method: 'POST'
        };
        var obj = { name: 'bob' };
        var expRes = 'Range: "bytes"\n\tStart: 0,\tEnd: 1023';
        helper.postJson(opts, obj, 'Only application/json is accepted', done);
    });

    after(function(done) {
        providers.close(function() {
            done();
        });
    });
});
