module.exports = function contentTypeDefined(res, header) {
    return res.headersSent ||
        undefined !== header('content-type');
}
