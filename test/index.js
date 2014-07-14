var assert = require('assert');
var molded = require('../');

describe('Molded', function() {
    
    var app;
    beforeEach(function() {
        app = molded();
    });

    it('exists', function() {
        assert(app !== undefined);
    });
});
