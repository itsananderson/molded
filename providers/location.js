function location(req, header, url){
    // "back" is an alias for the referrer
    if ('back' == url) url = req.headers['referrer'] || '/';

    // Respond
    header('Location', url);
    return this;
};

module.exports = function() {
    return function(res, req, header) {
        return location.bind(res, req, header);
    }
};
