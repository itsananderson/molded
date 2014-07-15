var assert = require('assert');
var http = require('http');
var app = require('../../examples/users');
var request = require('supertest')(app);

describe('Users Example', function() {
    it('exists', function() {
        assert(app != undefined);
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
});
