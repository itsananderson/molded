var mime = require('mime');

function contentType(header, type){
  return header('Content-Type', ~type.indexOf('/')
    ? type
    : mime.lookup(type));
};

module.exports = function() {
    return function(header) {
        return contentType.bind(null, header);
    };
};
