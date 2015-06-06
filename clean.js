var settings = require('./settings');
var fs = require('fs');

module.exports = function () {
  fs.readdirSync(settings.dir + 'tmp').map(function (file) {
    return fs.unlinkSync(settings.dir + 'tmp/' + file);
  });
  fs.readdirSync(settings.dir + 'raw').map(function (file) {
    return fs.unlinkSync(settings.dir + 'raw/' + file);
  });
};

