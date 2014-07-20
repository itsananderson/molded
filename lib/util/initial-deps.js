var definition = require('./definition');

function initialDeps(req, res, next, err) {
    var deps = [
        definition.initial('ALL', /.*/, 'req', req),
        definition.initial('ALL', /.*/, 'res', res),
    ];
    deps.push(definition.initial('ALL', /.*/, 'next', next));
    if (err) {
        deps.push(definition.initial('ALL', /.*/, 'err', err));
    }
    return deps;
}

module.exports = initialDeps;
