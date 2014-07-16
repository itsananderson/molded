var contentTypeDefined = require('../lib/util/content-type-defined');

function send(sendJson, contentType, header, status, content) {
    if (typeof status === 'number') {
        this.statusCode = status;
    } else {
        content = status;
    }
    if (typeof content === 'string') {
        if (!contentTypeDefined(this, header)) {
            contentType('html');
        }
        this.write(content);
        this.end();
    } else if (Buffer.isBuffer(content)) {
        this.write(content);
        this.end();
    } else if (undefined === content) {
        this.end('undefined');
    } else {
        sendJson(content);
    }
}

module.exports = function() {
    return function(res, sendJson, contentType, header) {
        return send.bind(res, sendJson, contentType, header);
    };
};
