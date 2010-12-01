exports.assert = assert = require('assert');
exports.solr = solr = require('../solr');
exports.sys = sys = require('sys');

// Replace if different from defaults
var HOST = '';  // 127.0.0.1
var PORT = '';  // 8983
var CORE = '';  // No core

exports.createClient = function () {
  var client = solr.createClient(HOST, PORT, CORE);
  client.on('error', function (e) {
    throw new Error('Unable to connect to Solr');
  });
  return client;
};

