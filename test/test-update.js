var common = require('./common');
var assert = common.assert;
var client = common.createClient();
var solr = common.solr;

common.expected = 9;

client.del(null, '*:*', function(err) {  // Clean up index
  if (err) throw err;
  client.commit(function(err) {
    if (err) throw err;
    var doc = {
      id: '1',
      fizzbuzz_t: 'foo',
      wakak_i: '5'
    };
    client.add(doc, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Add document failed.');
    });
    doc = {
      id: 2,
      fizzbuzz_t: 'bar',
      wakak_i: 5
    };
    client.add(doc, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Add document with int ID failed.');
    });
    doc = {
      id: 3,
      fizzbuzz_t: 'bar',
      unimath_t: '½ + ¼ = ¾'
    };
    client.add(doc, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Add document with unicode failed.');
    });
    doc = {
      id: 4,
      fizzbuzz_t: 'foo',
      wakak_i: '7'
    };
    var options = {
      overwrite: false
    };
    client.add(doc, options, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Add document with false overwrite option failed.');
    });
    var id = 1;
    var query = null;
    client.del(id, query, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Delete document by ID failed.');
    });
    id = null;
    query = 'fizzbuzz_t:bar';
    client.del(id, query, function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Delete document by query failed.');
    });
    doc = {
      fizzbuzz_t: 'foo',
      wakak_i: '5'
    };
    client.add(doc, function(err, res) {
      assert.ok(/missing required field: id/.test(err.message), 'Add document without ID should fail.');
    });
    client.add({id: 5, fizzbuzz_t: 'baz'}, function(err, res) {
      if (err) throw err;
      client.commit(function(err, res) {
        if (err) throw err;
        client.add({id: 6, fizzbuzz_t: 'baz'}, function(err, res) {
          if (err) throw err;
          client.rollback(function(err, res) {
            if (err) throw err;
            client.query('fizzbuzz_t:baz', function(err, res) {
              if (err) throw err;
              assert.equal(JSON.parse(res).response.docs.length, 1, 'Rollback test failed.');
            });
          });
        });
      });
    });
    client.optimize(function(err, res) {
      if (err) throw err;
      assert.equal(solr.getStatus(res), 0, 'Optimize failed.');
    });
  });
});
