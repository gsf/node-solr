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
      fizzbuzz_t: {
        params: {
          update: 'set'
        },
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      },
      wakak_i: {
        params: {
          inc: 2
        },
        value: 5
      }
    };

    console.log(doc);
    client.add(doc, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Add document with field parameters.');
      client.commit(function(err, res) {
        if (err) throw err;
      });
    });
  });
});

