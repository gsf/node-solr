// Clean up index
exports.delAll = function (test) {
  test.expect(1);
  client.del(null, '*:*', function () {
    client.commit(function (err, res) {
      test.equal(solr.getStatus(res), 0);
      test.done();
    });
  });
};
  
// Add a document for querying
exports.add = function (test) {
  test.expect(1);
  var doc = {
    id: "1",
    fizzbuzz_t: "foo",
    wakak_i: "5",
    bar_t: "11:15 is 11:00 + 15 minutes"
  };
  client.add(doc, function () {
    client.commit(function (err, res) {
      test.equal(solr.getStatus(res), 0);
      test.done();
    });
  });
};

exports.query = function (test) {
  test.expect(1);
  var query = "wakak_i:5";
  client.query(query, function (err, res) {
    test.equal(JSON.parse(res).response.numFound, 1);
    test.done();
  });
};

exports.rawQuery = function (test) {
  test.expect(1);
  var queryParams = "q=fizzbuzz_t:foo"
  client.rawQuery(queryParams, function (err, response) {
    test.equal(solr.getStatus(response), 0);
    test.done();
  });
};

exports.errorQuery = function (test) {
  test.expect(1);
  var query = "bob:poodle";
  client.query(query, function (err, response) {
    test.equal(err.message, "undefined field bob");
    test.done();
  });
};

exports.unescapedValue = function (test) {
  test.expect(1);
  var query = "bar_t:11:15";
  client.query(query, function (err, response) {
    test.ok(err);
    test.done();
  });
};

exports.escapedValue = function (test) {
  test.expect(1);
  var query = "bar_t:" + solr.valueEscape("11:00 + 15");
  client.query(query, function (err, response) {
    test.equal(JSON.parse(response).response.numFound, 1);
    test.done();
  });
};

// Clean up index
exports.delAll2 = function (test) {
  test.expect(1);
  client.del(null, '*:*', function () {
    client.commit(function (err, res) {
      test.equal(solr.getStatus(res), 0);
      test.done();
    });
  });
};
  
