var mixin = require('utils-merge');

function clearCookie(cookie, name, options) {
  var opts = { expires: new Date(1), path: '/' };
  return cookie(name, '', options
    ? mixin(opts, options)
    : opts);
};

module.exports = function() {
    return function(res, cookie) {
        return clearCookie.bind(res, cookie);
    };
};
