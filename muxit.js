var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var Q = require('q');
var events = require('events');
var spawn = require('child_process').spawn;

var videos, inputs;
var output = process.argv[2];
var outfile;

fs.readdir('./video/', function (err, list) {
  videos = list;
  muxing(list);
});

var promises = [];

var muxing = function (list) {
  console.log('Getting duration of videos, stripping to 2 sec')
  list.forEach(function (video, i) {
    ffmpeg.ffprobe('./video/' + video, function (err, metadata) {
        var duration = metadata.format.duration;
        var outfile;
        var promise = Q.defer();
        promises.push((promise)
        outfile = ffmpeg('./video/' + video).seek(duration / 2).setDuration(2.0)
          .output('./tmp/' + i + '.mp4')
          .on('end', function () {
            promise.resolve();
          })
          .run()
      });
  });
};

var merger = function () {
  console.log('Concatenating videos, this takes a while');
  var concatString = "";
  fs.readdir('./tmp/', function (err, list) {
    list.forEach(function (tmp, i) { 
      concatString += 'file tmp/' + tmp + "\n";  
    });
    fs.writeFileSync('input.txt', concatString);
    concat = spawn('ffmpeg', ['-f', 'concat', '-i', 'input.txt', 'out.mp4']);
    concat.stderr.on('data', function (data) {
      console.log('error' + data)
    });
    concat.on('close', function (code) {
      console.log(code);
    });
  });     
  // ffmpeg -f concat -i .txt
 
};

Q.all(promises)
  .then(merger);

