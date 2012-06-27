var common = require('./common');
var assert = common.assert;
var client = common.createClient();
var solr = common.solr;

common.expected = 5;

client.del(null, '*:*', function(err) {  // Clean up index
  if (err) throw err;
  var doc = {
    id: '1',
    fizzbuzz_t: 'foo',
    wakak_i: '5',
    bar_t: '11:15 is 11:00 + 15 minutes'
  };
  client.add(doc, function(err) {
    if (err) throw err;
    client.commit(function(err) {
      if (err) throw err;
      var query = 'wakak_i:5';
      client.query(query, function(err, res) {
        if (err) throw err;
        assert.equal(JSON.parse(res).response.numFound, 1, 'Query failed.');
      });
      client.get('select?q=fizzbuzz_t:foo', function(err, res) {
        if (err) throw err;
        assert.equal(solr.getStatus(res), 0, 'Raw query failed.');
      });
      query = 'bob:poodle';
      client.query(query, function(err) {
        assert.equal(err.message, 'undefined field bob', "Undefined field didn't error right.");
      });
      query = 'bar_t:11:15';
      client.query(query, function(err) {
        assert.ok(err, "Unescaped query didn't error right.");
      });
      query = 'bar_t:' + solr.valueEscape('11:00 + 15');
      client.query(query, function(err, res) {
        if (err) throw err;
        assert.equal(JSON.parse(res).response.numFound, 1, 'Escaped query failed.');
      });
    });
  });
});
