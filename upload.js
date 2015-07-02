var settings = require('./settings');
var spawn = require('child_process').spawn;
var creds = require(settings.dir + './creds');
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: creds.t.key,
    consumer_secret: creds.t.secret,
    access_token_key: creds.t.tokenKey,
    access_token_secret: creds.t.tokenSecret
});
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
    if ((data + '').indexOf('Video URL:') > -1) {
      var url = ('' + data).split('Video URL: ')[1];
      var message = 'Make the #news be a #daily #painkiller #scrape: \n' + url;
      client.post('statuses/update', {status: message}, function(error, tweet, response){
          if (!error) {
                console.log("Tweeting succesful", tweet.id);
                  }
          else {console.log(error);}
      });
    }
  });
  upload.stdout.on('data', function (data) {
    console.log(''+data);
  });
};
