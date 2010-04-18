var asyncTesting = require("async_testing");
var fs = require("fs");
var path = require("path");

// extend cobbled together from suggestions in
// http://groups.google.com/group/nodejs/browse_thread/thread/e82b45b3f8faa5af
function extend (a, b) {
  var property;
  for (property in b) {
    a[property] = b[property];
  }
  return a;
}

fs.readdirSync(path.dirname(module.filename)).forEach(function (filename) {
  if (filename.match(/.js$/) && filename != "all.js") {
    extend(exports, require("./" + path.basename(filename, ".js")));
  }
});

asyncTesting.runSuites(exports);

// Contingent upon async_testing acceptance
//asyncTesting.runSuitesInPaths([path.dirname(module.filename)]);

