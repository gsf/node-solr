var assert = require('assert');
var fs = require('fs');
var path = require('path');
var solr = require('../solr');
var sys = require('sys');

var client = solr.createClient();

// Make sure index is clean before tests are run
client.del(null, '*:*', function () {
  client.commit(function () {
    var test_module;
    fs.readdirSync(path.dirname(module.filename)).forEach(function (filename) {
      if (filename.match(/^[^t].+\.js$/) && filename != 'run.js') {
        sys.puts(filename);
        test_module = require('./' + path.basename(filename, '.js'));
        sys.puts(sys.inspect(test_module));
        //extend(exports, require("./" + path.basename(filename, ".js")));
      }
    });
    client.destroy();
  });
});

