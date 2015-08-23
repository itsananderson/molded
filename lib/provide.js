var funcDeps = require("func-deps");

module.exports = function (name, provider) {
    var deps = funcDeps(provider);
    return function (req, res, next) {
        if (!req._moldedProviders) {
            req._moldedProviders = {};
        }
        req._moldedProviders[name] = {
            provider: provider,
            deps: deps
        };
        next();
    };
};
