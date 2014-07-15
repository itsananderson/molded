var assert = require('assert');
var http = require('http');
var users = require('../../examples/users');
var host = 'localhost';
var port = 3000;
var request = require('supertest')('http://localhost:3000');

describe('Users Example', function() {
    before(function() {
        users.listen(port);
    });

    it('exists', function() {
        assert(users != undefined);
    });

    it('starts empty', function(done) {
        request
            .get('/users')
            .expect([], done);
    });

    var newUser = {
        name: 'bob',
        age: 25
    };
    function addUser(cb) {
        request
            .post('/register')
            .send(newUser)
            .expect({success:true}, cb)
    }

    it('adds users', function(done) {
        addUser(function(err, str, res) {
            request
                .get('/users')
                .expect([newUser], done);
        });
    });


    it('adds multiple users', function(done) {
        addUser(function() {
            addUser(function() {
            request
                .get('/users')
                .expect([newUser, newUser], done);
            });
        });
    });

    it('purges users for each test', function(done) {
        request
            .get('/users')
            .expect([], done);
    });

    afterEach(function(done) {
        request
            .post('/purge')
            .send({})
            .expect({success:true}, function(err) {
                if (err) return done(err);
                request
                    .get('/users')
                    .expect([], done);
            });
    });

    after(function(done) {
        users.close(function() {
            done();
        });
    });
});
