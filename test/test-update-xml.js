var common = require('./common');
var assert = common.assert;
var client = common.createClient();
var solr = common.solr;

common.expected = 1;

client.del(null, '*:*', function(err) {  // Clean up index
  if (err) throw err;
  client.commit(function(err) {
    if (err) throw err;
    var doc = {
      id: 2,
      fizzbuzz_t: 'value with <xml> &chars;',
      wakak_i: 5
    };
    client.add(doc, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Add document with value with XML characters failed.');
      client.commit(function(err, res) {
        if (err) throw err;
      });
    });
  });
});

