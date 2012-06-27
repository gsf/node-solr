var assert = require('assert');
var solr = exports.solr = require('../lib/solr');

exports.createClient = function(options) {
  var client = solr.createClient(options);
  client.on('error', function (e) {
    throw new Error('Unable to connect to Solr');
  });
  return client;
};

exports.expected = 0;

var count = 0;
var wrapAssert = function(fn) {
  return function() {
    assert[fn].apply(this, arguments);
    count++;
    process.stdout.write('.');
  };
};
exports.assert = {};
// add all functions from the assert module
for (var fn in assert) {
  if (assert.hasOwnProperty(fn)) {
    exports.assert[fn] = wrapAssert(fn);
  }
}

process.on('exit', function() {
  process.stdout.write(' ran ' + count + ' of ' + exports.expected + ' tests.\n');
});
