var settings = require('./settings');
var Q = require('q');
var ytdl = require('ytdl-core');
var search = require('youtube-search');
var creds = require(settings.dir + 'creds.json');
var upload = require(settings.dir + 'upload');
var fs = require('fs')
var ffmpeg = require('fluent-ffmpeg');

function duration (err, metadata) {
  if (err) {throw new Error(err)}
  	console.log(metadata.format.duration)
 	return metadata.format.duration;
}


function downloadSong () {
  search('', {key: creds.oauth, maxResults: Math.floor(Math.random() * 10), startIndex:Math.floor(Math.random() * 10) }, function (err, results) {
    if (err) return console.error(err);
    if (results.length == 0) { return; }

    var link = results[Math.floor(Math.random() * results.length - 1)].link;
    var video = ytdl(link);
      video.pipe(fs.createWriteStream(settings.dir + 'raw/song.mp3'))
      video.on('end', function () {      
      ffmpeg.ffprobe(settings.dir + 'raw/song.mp3', function (err, metadata) {
        var audioDur = duration(err, metadata);
        ffmpeg(settings.dir + 'raw/song.mp3')
          .seek(audioDur / 2 * Math.random())
          .output(settings.dir + 'tmp/audio.mp3')
          .on('end', music)
          .run()
      });
    });
  });

}

var music = function () {
	var audioDur, videoDur;
  	ffmpeg.ffprobe(settings.dir + 'tmp/vid.mp4', function (err, metadata) {
  		videoDur = duration(err, metadata);
  		ffmpeg(settings.dir + 'tmp/vid.mp4')
	  	.input(settings.dir + 'tmp/audio.mp3')
	  	// .seek(audioDur / 2 * Math.random())
	  	.duration(videoDur)
	  	.output(settings.dir + 'out.mp4')
      .on('end', upload)
	  	// .outputOptions('-newaudio')
	  	.run();
  	// })
  })
}

module.exports = downloadSong;
