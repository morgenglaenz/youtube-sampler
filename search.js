var settings = require('./settings');
var Q = require('q');
var search = require('youtube-search');
// var youtdl = require('youtube-dl');
var ytdl = require('ytdl-core');
var fs = require('fs');
var creds = require('./creds.json');
var NYT = require('nyt');
var youtdl = require('youtube-dl');

var nyt = new NYT(creds.nyt);

var anon = process.argv[2];

var promises = [];
var cb;
var once;

function searchYT (result) {
  var opts = {
    maxResults: 1,
    startIndex: 1,
    key: creds.oauth
  };

  var defer = Q.defer();
  promises.push(defer.promise);

  if (!once) {
    once = true;
    Q.all(promises).then(cb);
  }

  return search(result.title, opts, processYTSearch);
}

function processYTSearch (err, results) {
  if (err) return console.error(err);
  if (results.length === 0) { return; }
  //console.log('I have this much stuff', results.length);
  return Q.all(results.map(function (result, i) {
    var video;
    if (creds.user && creds.pass &&
        anon !== 'true') {
      console.log('auth is on for user: ' + creds.user);
      console.log(result.link)
      if (!result.link || result.link.split('v=')[1] === 'undefined') { return; }
      video = youtdl(result.link, ['-u ' + creds.user, '-p ' + creds.pass]);
    } else {
      //console.log('im downloadings stuff without auth');
     //debugger
      video = ytdl(result.link);
    }
    var keyWord = result.title.split(' ')[0].replace(/\//gi, '-');
    video.on('end', function () {
      console.log('thisone is done: ', keyWord);
    });
    video
      .pipe(fs.createWriteStream(settings.dir + 'raw/tmp-' + keyWord + '_' +  i + '.mp4'));
    
    }));

}

function topStories (cb) {
  
  nyt.newswire.recent({section: 'all'}, function (response) {
    var results = JSON.parse(response).results;
    results.map(searchYT);
  });

}


topStories();
//module.exports = topStories;
