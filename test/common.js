var assert = require('assert');
var print = exports.print = require('sys').print;
var solr = exports.solr = require('../lib/solr');

// Replace if different from defaults
var HOST = '';  // 127.0.0.1
var PORT = '';  // 8983
var CORE = '';  // No core
var PATH = '';  // /solr

var count = 0;
var wrapAssert = function(fn) {
  return function() {
    assert[fn].apply(this, arguments);
    count++;
    print('.');
  };
};
exports.assert = {};
// add all functions from the assert module
for (var fn in assert) {
  if (assert.hasOwnProperty(fn)) {
    exports.assert[fn] = wrapAssert(fn);
  }
}

exports.createClient = function() {
  var client = solr.createClient(HOST, PORT, CORE, PATH);
  client.on('error', function (e) {
    throw new Error('Unable to connect to Solr');
  });
  return client;
};

exports.expected = 0;

process.on('exit', function() {
  print(' ran ' + count + ' of ' + exports.expected + ' tests.\n');
});
