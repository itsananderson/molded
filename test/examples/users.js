var assert = require('assert');
var http = require('http');
var users = require('../../examples/users');
var host = 'localhost';
var port = 3000;
var helper = require('./helper')(host, port);

describe('Users Example', function() {
    before(function() {
        users.listen(port);
    });

    it('exists', function() {
        assert(users != undefined);
    });

    it('starts empty', function(done) {
        helper.expectJson('/users',  [], done);
    });

    var newUser = {
        name: 'bob',
        age: 25
    };
    function addUser(cb) {
        helper.postJson('/register', newUser, {success:true}, cb);
    }

    it('adds users', function(done) {
        addUser(function(err, str, res) {
            helper.expectJson('/users', [newUser], done);
        });
    });


    it('adds multiple users', function(done) {
        addUser(function() {
            addUser(function() {
                helper.expectJson('/users', [newUser, newUser], done);
            });
        });
    });

    it('purges users for each test', function(done) {
        helper.expectJson('/users', [], done);
    });

    afterEach(function(done) {
        helper.postJson('/purge', {}, {success:true}, function(err, str, res) {
            helper.expectJson('/users', [], done);
        });
    });

    after(function(done) {
        users.close(function() {
            done();
        });
    });
});
