var mixin = require('utils-merge');
var sign = require('cookie-signature').sign;
var _cookie = require('cookie');

function cookie(req, header, name, val, options){
  options = mixin({}, options);
  var secret = req.secret;
  var signed = options.signed;
  if (signed && !secret) throw new Error('cookieParser("secret") required for signed cookies');
  if ('number' == typeof val) val = val.toString();
  if ('object' == typeof val) val = 'j:' + JSON.stringify(val);
  if (signed) val = 's:' + sign(val, secret);
  if ('maxAge' in options) {
    options.expires = new Date(Date.now() + options.maxAge);
    options.maxAge /= 1000;
  }
  if (null == options.path) options.path = '/';
  var headerVal = _cookie.serialize(name, String(val), options);

  // supports multiple 'res.cookie' calls by getting previous value
  var prev = header('Set-Cookie');
  if (prev) {
    if (Array.isArray(prev)) {
      headerVal = prev.concat(headerVal);
    } else {
      headerVal = [prev, headerVal];
    }
  }
  header('Set-Cookie', headerVal);
  return this;
};

module.exports = function() {
    return function(res, req, header) {
        return cookie.bind(res, req, header);
    }
};
