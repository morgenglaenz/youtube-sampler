var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var Q = require('q');
var events = require('events');
var spawn = require('child_process').spawn;

var videos, inputs;
var output = process.argv[2];
var outfile;
var promises = [];
var threadsQueue = [];
var MAX_THREADS = 4;

fs.readdir('./video/', function (err, list) {
  videos = list;
  var filesPromise = Q.defer();
  promises.push(filesPromise.promise);
  muxing(list, filesPromise);
});


var muxing = function (list, filesPromise) {
  console.log('Getting duration of videos')
  list.forEach(function (video, i) {
    ffmpeg.ffprobe('./video/' + video, function (err, metadata) {
      theMachine(metadata, video, i, (i === list.length - 1), filesPromise);
    });
  });
};

var seekAndStrip = function (duration, video, promise, index) {
 ffmpeg('./video/' + video).seek(duration / 2).setDuration(2.0)
    .output('./tmp/' + index + '.mp4')
    .on('end', function () {
      console.log('################ Im resolvingyieha')
      promise.resolve();
    })
  .run()
};

Make promises -> add to queue.
If queue done, make more promises,
   until finally queue is empty.







var theMachine = function (metadata, video, index, last, filesPromise) {
  var emptyQueue = true;
  var threadsPromise;
  var duration = metadata.format.duration;
  var outfile;
  var promise = Q.defer();
  promises.push(promise.promise);

  if (threadsQueue.length < 4) {
    threadsQueue.push(promise.promise);
    emptyQueue = false;
    seekAndStrip(duration, video, promise, index);
    if (emptyQueue) {
    threadsPromise = Q.all(threadsQueue)
      .then(function () {
        emptyQueue = true;
        threadsQueue = [];
      });
    }
  }
    if (last) {
      Q.all(promises)
        .then(merger);
      filesPromise.resolve();
    }
}



var merger = function () {
  console.log('Concatenating videos, this takes a while');
  var concatString = "";
  fs.readdir('./tmp/', function (err, list) {
    list.forEach(function (tmp, i) { 
      concatString += 'file tmp/' + tmp + "\n";  
    });
    fs.writeFileSync('input.txt', concatString);
    concat = spawn('ffmpeg', ['-y', '-f', 'concat', '-i', 'input.txt', 'out.mp4']);
    concat.stderr.on('data', function (data) {
      console.log('error' + data)
    });
    concat.on('close', function (code) {
      console.log(code);
    });
  });     
 
};


