var funcDeps = require("func-deps");

module.exports = function (handler) {
    var deps = funcDeps(handler);
    return function(req, res, next) {
        console.log(deps);
        next();
    };
};
