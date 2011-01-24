var common = require('./common');
var assert = common.assert;
var client = common.createClient();
var solr = common.solr;

common.expected = 3;

client.del(null, '*:*', function(err) {  // Clean up index
  if (err) throw err;
  client.commit(function(err) {
    if (err) throw err;
    var doc = [
      {
        id: 1,
        fizzbuzz_t: 'foo',
        wakak_i: 5
      },
      {
        id: 2,
        fizzbuzz_t: 'bar',
        wakak_i: 5
      }
    ];
    client.add(doc, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Add document array failed.');
      doc = {
        id: 3,
        fizzbuzz_t: 'fuzz',
        wakak_i: 5,
        cat: ['foo', 'bar']
      };
      client.add(doc, function(err, res) {
        if (err) throw err;
        assert.equal(solr.getStatus(res), 0, 'Add document with value array failed.');
        client.commit(function(err, res) {
          if (err) throw err;
          client.query('wakak_i:5', function(err, res) {
            if (err) throw err;
            assert.equal(JSON.parse(res).response.numFound, 3, 'Wrong number of docs in index.');
          });
        });
      });
    });
  });
});


