var settings = require('./settings');
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var Q = require('q');
var events = require('events');
var spawn = require('child_process').spawn;
var music = require('./music');

var videos, inputs;
var output = process.argv[2];
var outfile;
var promises = [];
var threadsQueue = [];
var MAX_THREADS = 4;

fs.readdir(settings.dir + 'raw/', function (err, list) {
  videos = list;
  var filesPromise = Q.defer();
  promises.push(filesPromise.promise);
  muxing(list, filesPromise);
});


var muxing = function (list, filesPromise) {
  console.log('Getting duration of videos')
  list.forEach(function (video, i) {
    if (video.split('.')[1] !== 'mp4') {
      list.splice(list.indexOf(video), 1)
      return}
    ffmpeg.ffprobe(settings.dir + 'raw/' + video, function (err, metadata) {
      if (err) {throw new Error(err)}
      theMachine(metadata, video, i, (i === list.length - 1), filesPromise);
    });
  });
};

var seekAndStrip = function (duration, video, promise, index) {
  // var strip = spawn('ffmpeg',
  //   ['-i', settings.dir + 'video/' + video,
  //    '-c', 'copy', '-an',
  //    '-bsf:v', 'h264_mp4toannexb',
  //    '-f', 'mpegts',
  //    'scale=854x480',
  //    '-ss', '' + (duration / 2 * Math.random()),
  //    '-t', '0.5',
  //    '-y', settings.dir + 'tmp/' + index + '.ts']);
  // strip.stderr.on('data', function (data) {
  //     console.log('LOG: ' + data)
  //   });
  // strip.on('close', function (code) {
  //   console.log('number and exit code: ', index, code);
  //   promise.resolve();
  // })

 ffmpeg(settings.dir + 'raw/' + video).seek(duration / 2 * Math.random()).setDuration(0.5)
    .videoBitrate('1000k')
    .size('854x480')
    .noAudio()
    .autopad()
    .outputOptions('-f mpegts')
    .outputOptions('-bsf:v h264_mp4toannexb')
    .output(settings.dir + 'tmp/' + index + '.ts')
    .on('error', function(err, stdout, stderr) {
      console.log('Cannot process video: ' + err.message);
    })
    .on('end', function () {
      console.log('################ Im resolvingyieha')
      promise.resolve();
    })
  .run()
};

//Make promises -> add to queue.
//If queue done, make more promises,
   //until finally queue is empty.

var worker = function () {
  var localPromises = [];
  var things = threadsQueue.splice(0, MAX_THREADS);
  things.forEach(function (thing, index) {
    localPromises.push(thing.promise.promise);
    seekAndStrip(thing.duration, thing.video, thing.promise, thing.index);
    if (things.length > 0 && index === things.length -1) {
      Q.all(localPromises).then(worker);
    }
  });
};


var theMachine = function (metadata, video, index, last, filesPromise) {
  var emptyQueue = true;
  var threadsPromise;
  var duration = metadata.format.duration;
  var outfile;
  var promise = Q.defer();
  promises.push(promise.promise);
  threadsQueue.push({
    duration: duration,
    video: video,
    promise: promise,
    index: index
  });

   if (last) {
      Q.all(promises)
        .finally(merger);
      filesPromise.resolve();
      worker();
    }
}


var randomizeArray = function (arr) {
  var n = arr.length;
  var tempArr = [];
  for ( var i = 0; i < n-1; i++ ) { 
    // The following line removes one random element from arr 
    // and pushes it onto tempArr
    tempArr.push(arr.splice(Math.floor(Math.random()*arr.length),1)[0]); 
  } 
  // Push the remaining item onto tempArr
  tempArr.push(arr[0]);
  arr=tempArr; 
  
  return tempArr;
  //http://osric.com/chris/accidental-developer/2012/07/javascript-array-sort-random-ordering/
};


var merger = function (cb) {
  console.log('Concatenating videos, this takes a while');
  var concatString = "concat:";
  fs.readdir(settings.dir + 'tmp/', function (err, list) {
    var randlist = randomizeArray(list)
    randlist.forEach(function (tmp, i) { 
      concatString += settings.dir + 'tmp/' + tmp
      if (randlist.length - 1 !== i) {
        concatString += "|";
      }
    });
    fs.writeFileSync('input.txt', concatString);
    var audio;
    concat = spawn('ffmpeg', [
      '-y', '-i', concatString,
      '-an', '-vcodec', 'copy', settings.dir + 'tmp/vid.mp4']);
    concat.stderr.on('data', function (data) {
      console.log('LOG: ' + data)
    });
    concat.on('close', function (code) {
      console.log(code);
    });
  });     
 
};


