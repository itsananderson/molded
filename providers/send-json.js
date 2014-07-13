function contentTypeDefined(res) {
    return res.headersSent ||
        undefined !== res.getHeader('content-type');
}

function sendJson(content) {
    if (!contentTypeDefined(this)) {
        this.setHeader('Content-Type', 'application/json');
    }
    this.write(JSON.stringify(content));
    this.end();
}

module.exports = function() {
    return function(res) {
        return sendJson.bind(res);
    };
};
