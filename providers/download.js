var contentDisposition = require('../lib/util/content-disposition.js');

function download(sendFile, path, filename, fn){
  // support function as second arg
  if ('function' == typeof filename) {
    fn = filename;
    filename = null;
  }

  filename = filename || path;

  // set Content-Disposition when file is sent
  var headers = {
    'Content-Disposition': contentDisposition(filename)
  };

  return sendFile(path, { headers: headers }, fn);
};

module.exports = function() {
    return function(res, sendFile) {
        return download.bind(res, sendFile);
    };
};
