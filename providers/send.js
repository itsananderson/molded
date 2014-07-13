function contentTypeDefined(res) {
    return res.headersSent ||
        undefined !== res.getHeader('content-type');
}

function send(sendJson, status, content) {
    var args = Array.prototype.slice.apply(arguments);
    if (typeof status === 'number') {
        this.statusCode = args.shift();
    } else {
        content = status;
    }
    if (typeof content === 'string') {
        if (!contentTypeDefined(this)) {
            this.setHeader('Content-Type', 'text/html');
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
    return function(res, sendJson) {
        return send.bind(res, sendJson);
    };
};
