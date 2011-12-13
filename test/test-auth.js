// This doesn't actually test Basic Auth unless the Solr server is set up for it
// see example for doing that at http://wiki.apache.org/solr/SolrSecurity
var common = require('./common');
var assert = common.assert;
var solr = common.solr;
var client = common.createClient({
  headers: {
    'Authorization': 'Basic ' + new Buffer('guest:guest').toString('base64')
  }
});

common.expected = 1;

client.del(null, '*:*', function(err) {  // Clean up index
  if (err) throw err;
  client.commit(function(err) {
    if (err) throw err;
    var data = '<docs><doc><field name="id">1</field><field name="fizzbuzz_t">foo</field><field name="wakak_i">5</field></doc></docs>';
    client.post('analysis/document', data, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Post failed.');
    });
  });
});
