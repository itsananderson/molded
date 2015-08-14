var assert = require('assert');
var http = require('http');
var mixin = require('utils-merge');

var application = require('../lib/application');
var definition = require('../lib/util/definition');

function makeApp(app) {
    app = app || {
        providers: [],
        singletons: [],
        values: [],
        handlers: [],
        errorHandlers: []
    };
    mixin(app, application);
    return app;
}

describe('application', function() {
    it('only resolves when methods match', function(done) {
        var app = makeApp();
        app.providers.push(definition.provider(
            'POST', /\//, 'post', function(){}));
        app.resolveDeps('GET', '/', {}, [{name:'next'}], ['post'])
            .then(function(result) {
                assert.fail('failure', 'success',
                    'Expected unresolved error');
            }, function(err) {
                assert.equal(err.message, 'Unresolved dependency: post');
            }).done(done);
    });

    it('lets you set and get values', function() {
        var app = makeApp();
        app.value('foo', 123);
        assert.equal(app.value('foo'), 123);
    });

    it('gracefully handles undefined value', function() {
        var app = makeApp();
        assert.equal(app.value('foo'), undefined);
    });

    it('lets you listen', function() {
        var app = require('../index')();
        var server = app.listen(0);
        assert(server.address().port);
        server.close();
    });

    it('matches error handler methods', function(done) {
        var app = makeApp();
        var fakeRes = {
            write: function() {},
            end: function() {}
        };
        function fail() {
            assert.fail('handler2', 'handler1', 'Expected handler 2');
            done();
        }
        app.errorHandlers.push(definition.error('POST', /\//, 'handler1', function() {
            // Should not match
            setTimeout(fail);
        }));
        app.errorHandlers.push(definition.error('GET', /\//, 'handler2', function() {
            // Should get here
            done();
        }));

        app.handleError({method: 'GET', url: '/'}, fakeRes, new Error('test'));
    });
});
