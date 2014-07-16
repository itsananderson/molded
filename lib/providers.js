var definition = require('./util/definition');

var coreProviderNames = [
    'send-json', 'send', 'send-file', 'download',
    'accepts', 'accepts-encodings',
    'accepts-charsets', 'accepts-languages',
    'range', 'type-is',
    'content-type', 'format', 'vary'];
var coreProviders = [];

coreProviderNames.forEach(function(providerName) {
    var injectionName = providerName.replace(/\W+(.)/g, function (x, chr) {
        return chr.toUpperCase();
    });    
    var provider = require('../providers/' + providerName);
    coreProviders.push(
        definition.provider('ALL', /.*/, injectionName, provider()));
});

module.exports = coreProviders;
