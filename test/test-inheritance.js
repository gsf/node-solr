var common = require('./common');
var util = require('util');
var assert = common.assert;
var solr = common.solr;

common.expected = 3;

function MyClient () {
}

util.inherits(MyClient, solr.Client);

MyClient.prototype.test = function() {
}

var c = new MyClient();

assert.ok(typeof(c.test) == 'function');
assert.ok(typeof(c.del) == 'function');
assert.ifError(typeof(c.notAMethod) == 'function');

