var mime = require('mime');

function contentType(type){
  return this.setHeader('Content-Type', ~type.indexOf('/')
    ? type
    : mime.lookup(type));
};

module.exports = function() {
    return function(res) {
        return contentType.bind(res);
    };
};
