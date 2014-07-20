var normalizeType = require('../lib/util/normalize-type.js');
var normalizeTypes = require('../lib/util/normalize-types.js');

function format(req, next, accepts, vary, contentType, obj){
  var fn = obj.default;
  if (fn) delete obj.default;
  var keys = Object.keys(obj);

  var key = accepts(keys);

  vary("Accept");

  if (key) {
    contentType(normalizeType(key).value);
    obj[key](req, this, next);
  } else if (fn) {
    fn();
  } else {
    var err = new Error('Not Acceptable');
    err.status = 406;
    err.types = normalizeTypes(keys).map(function(o){ return o.value });
    next(err);
  }

  return this;
};

module.exports = function() {
    return function(res, req, next, accepts, vary, contentType) {
        return format.bind(res, req, next, accepts, vary, contentType);
    };
};
