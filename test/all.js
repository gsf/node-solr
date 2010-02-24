var sys = require('sys'),
    path = require('path'),
    fs = require('fs');

try {
  var runSuites = require('./async_testing').runSuites;
}
catch(err) {
  if( err.message == "Cannot find module './async_testing'" ) {
    var runSuites = require('./async_testing').runSuites;
  }
  else {
    throw err;
  }
}

if( process.ARGV.length < 3 ) {
  var paths_to_check = [process.cwd()];
}
else {
  var paths_to_check = [];
  process.ARGV.slice(2).forEach(function(dir) {
    if( dir.charAt(0) === '/' ) {
      paths_to_check.push(dir);
    }
    else {
      paths_to_check.push(path.join(process.cwd(),dir));
    }
  });
}

var testFiles = [];
var stats = {
  numSuites: 0,
  numFailed: 0
};

loadNextPath();


function loadNextPath() {
  if( paths_to_check.length == 0 ) {
    return runNextFile();
  }

  var cur_path = paths_to_check.shift();

  fs.readdir(cur_path, function (error, dir) {
      if(error) {
        throw error;
      }
      dir.forEach(function(file_name) {
          if( file_name.charAt(0) == '.' ) {
            // ignore 'hidden' files and folders
            return;
          }
          var stat = fs.statSync(path.join(cur_path, file_name));
          if( stat.isFile() ) {
            if( !file_name.match(/^test-.*\.js$/) ) {
              return;
            }
            testFiles.push(path.join(cur_path, file_name));
          }
          else if( stat.isDirectory() ) {
            paths_to_check.push(path.join(cur_path, file_name));
          }
        });
      loadNextPath();
    });
}

function runNextFile(sts) {
  if( sts ) {
    stats.numSuites += sts.numSuites;
    stats.numFailed += sts.numFailed;
    sys.error('----------------------------------');
  }

  if( testFiles.length < 1 ) {
    var output = '\n' + (stats.numSuites == 1 ? '1 suite' : stats.numSuites+' suites') + ' ran';
    if( stats.numFailed > 0 ) {
      output += ': ' + stats.numFailed + ' had failures';
    }
    sys.error(output);
    return;
  }
  var file = testFiles.shift();
  file = file.substr(0, file.length-3);
  var suites = require(file);

  runSuites(suites, runNextFile);
}
