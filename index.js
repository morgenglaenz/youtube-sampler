var search = require('youtube-search');
var ytdl = require('ytdl-core');
var fs = require('fs');

var keyWord = process.argv[2];

var opts = {
  maxResults: 10,
  startIndex: 1
};

console.log(keyWord);
search(keyWord, opts, function (err, results) {
  if (err) return console.error(err);
  results.forEach(function (result, i) {
    ytdl(result.url)
      .pipe(fs.createWriteStream('./video/tmp-' + keyWord + '_' + + i + '.mp4'));
      
  });
});


