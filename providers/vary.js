var vary = require('vary');

module.exports = function() {
    return function(res) {
        return function(field){
            vary(this, field);
            return this;
        }.bind(res);
    };
};
