var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var events = require('events');
var spawn = require('child_process').spawn;

var videos, inputs;
var output = process.argv[2];
var output;

fs.readdir('./video/', function (err, list) {
  videos = list;
  muxing(list);
});


var muxing = function (list) {
  list.forEach(function (video, i) {
    ffmpeg.ffprobe('./video/' + video, function (err, metadata) {
        var duration = metadata.format.duration;
        console.log(duration / 2)
        if (duration !== 'N/A') {
         output = ffmpeg('./video/' + video).seek(duration / 2).setDuration(2.0)
            .output('./tmp/' + i + '.mp4')
            .run()
        }
           
        if (!inputs) {
          inputs = ffmpeg('./video/' + video)
        }
        inputs
          .seek(duration / 2)
          .setDuration(2)

          
       if (videos.length - 1 === i) {
        inputs.mergeToFile('outputfile.mp4');
       }
      });
  });
};

 

