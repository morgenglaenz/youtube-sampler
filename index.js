var search = require('youtube-search');
var youtdl = require('youtube-dl');
var ytdl = require('ytdl-core');
var fs = require('fs');
var creds = require('./creds.json');

var keyWord = process.argv[2];
var anon = process.argv[3];

var opts = {
  maxResults: 10,
  startIndex: 1
};

var searchAndConquer = search(keyWord, opts, function (err, results) {
  if (err) return console.error(err);
  results.forEach(function (result, i) {
    var video;
    if (creds.user && creds.pass &&
        anon !== 'true') {
      console.log('auth is on for user: ' + creds.user);
      video = youtdl(result.url, ['-u ' + creds.user, '-p ' + creds.pass])
    } else {
      console.log('im downloadings stuff without auth');
      video = ytdl(result.url);
    }
    video
      .pipe(fs.createWriteStream('./video/tmp-' + keyWord + '_' + + i + '.mp4'));
      
  });
});


