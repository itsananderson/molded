var parseRange = require('range-parser');

function range(size) {
  var range = this.headers['range'];
  if (!range) return;
  return parseRange(size, range);
}

module.exports = function() {
    return function(req) {
        return range.bind(req);
    };
};
