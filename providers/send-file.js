var send = require('send');

sendFile = function(req, next, header, path, options, fn){
    options = options || {};
    var self = this;
    var done;


    // support function as second arg
    if ('function' == typeof options) {
        fn = options;
        options = {};
    }

    // socket errors
    req.socket.on('error', error);

    // errors
    function error(err) {
        /* istanbul ignore if */
        if (done) return;
        done = true;

        // clean up
        cleanup();

        // callback available
        /* istanbul ignore if */
        if (fn) return fn(err);

        // delegate
        next(err);
    }

    // streaming
    function stream(stream) {
        /* istanbul ignore if */
        if (done) return;
        cleanup();
        if (fn) stream.on('end', fn);
    }

    // cleanup
    function cleanup() {
        req.socket.removeListener('error', error);
    }

    // transfer
    var file = send(req, path, options);
    file.on('error', error);
    file.on('directory', next);
    file.on('stream', stream);

    if (options.headers) {
        // set headers on successful transfer
        file.on('headers', function headers(res) {
            var obj = options.headers;
            var keys = Object.keys(obj);

            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                header(k, obj[k]);
            }
        });
    }

    // pipe
    file.pipe(this);
    this.on('finish', cleanup);
};

module.exports = function() {
    return function(res, req, next, header) {
        return sendFile.bind(res, req, next, header);
    };
};
