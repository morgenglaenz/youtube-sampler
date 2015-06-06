var settings = require('./settings');
var clean = require('./clean');

var spawn = require('child_process').spawn;
var music = require('./music');

clean();
var searchProcess = spawn('node', [settings.dir + 'search']);
searchProcess.on('close', function () {
  var muxit = spawn('node', [settings.dir + 'muxit'])
  muxit.stdout.on('data', function (data) {
    console.log('' + data);
  }) ;
  muxit.on('close', function () {
    music();
  });
});
searchProcess.stdout.on('data', function (data) {
  console.log('' + data)
});

//var keyWord = process.argv[2];
//var searchAndConquer = search(keyWord, opts, processYTSearch);

// http://gdata.youtube.com/feeds/api/videos?orderby=relevance&safeSearch=none&v=2&q=
