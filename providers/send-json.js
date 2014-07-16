var contentTypeDefined = require('../lib/util/content-type-defined');

function sendJson(contentType, header, content) {
    if (!contentTypeDefined(this, header)) {
        contentType('json');
    }
    this.write(JSON.stringify(content));
    this.end();
}

module.exports = function() {
    return function(res, contentType, header) {
        return sendJson.bind(res, contentType, header);
    };
};
