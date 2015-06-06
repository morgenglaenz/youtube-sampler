var settings = require('./settings');
var spawn = require('child_process').spawn;
//var crypto = require('crypto');
//var proquint = require('proquint');

var title = new Date () + ' happiest day of my life';
//title = proquint.encode(crypto.createHash('sha256').update(title).digest());

module.exports = function () {
  var upload = spawn('youtube-upload',
      ['--title='+ title + '', settings.dir + 'out.mp4', '--client-secrets=' + settings.dir + 'secrets.json']);
  upload.on('close', function () {
    spawn('mv', ['out.mp4', 'archive/' + new Date() +'.mp4']);
  });

  upload.stderr.on('data', function (data) {
    console.log(''+data);
  });
  upload.stdout.on('data', function (data) {
    console.log(''+data);
  });
};
