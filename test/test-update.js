var solr = require("../solr");

var client = solr.createClient();

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
  
exports.add1 = function (test) {
  test.expect(1);
  var doc = {
    id: "1",
    fizzbuzz_t: "foo",
    wakak_i: "5"
  };
  client.add(doc, function (err, res) {
    test.equal(solr.getStatus(res), 0);
    test.done();
  });
};

exports.add2 = function (test) {
  test.expect(1);
  var doc = {
    id: 2,
    fizzbuzz_t: "bar",
    wakak_i: 5
  };
  client.add(doc, function (err, res) {
    test.equal(solr.getStatus(res), 0);
    test.done();
  });
};

exports.addUnicode = function (test) {
  test.expect(1);
  var doc = {
    id: 3,
    fizzbuzz_t: "bar",
    unimath_t: "½ + ¼ = ¾"
  };
  client.add(doc, function (err, res) {
    test.equal(solr.getStatus(res), 0);
    test.done();
  });
};

exports.addNoOverwrite = function (test) {
  test.expect(1);
  var doc = {
    id: 4,
    fizzbuzz_t: "foo",
    wakak_i: "7",
  };
  var options = {
    overwrite: false
  };
  client.add(doc, options, function (err, res) {
    test.equal(solr.getStatus(res), 0);
    test.done();
  });
};

exports.delById = function (test) {
  test.expect(1);
  var id = 1;
  var query = null;
  client.del(id, query, function (err, res) {
    test.equal(solr.getStatus(res), 0);
    test.done();
  });
};

exports.delByQuery = function (test) {
  test.expect(1);
  var id = null;
  var query = "fizzbuzz_t:bar";
  client.del(id, query, function (err, res) {
    test.equal(solr.getStatus(res), 0);
    test.done();
  });
};

exports.addNoId = function (test) {
  test.expect(1);
  var doc = {
    fizzbuzz_t: "foo",
    wakak_i: "5",
  };
  client.add(doc, function (err, res) {
    test.equal(err.message, "Document [null] missing required field: id");
    test.done();
  });
};

exports.commit = function (test) {
  test.expect(1);
  client.commit(function (err, res) {
    test.equal(solr.getStatus(res), 0);
    test.done();
  });
};

exports.add3 = function (test) {
  test.expect(1);
  var doc = {
    id: "3",
    fizzbuzz_t: "fizz",
    wakak_i: "5"
  };
  client.add(doc, function (err, res) {
    test.equal(solr.getStatus(res), 0);
    test.done();
  });
};

exports.rollback = function (test) {
  test.expect(1);
  client.rollback(function (err, res) {
    test.equal(solr.getStatus(res), 0);
    test.done();
  });
};

exports.optimize = function (test) {
  test.expect(1);
  client.optimize(function (err, res) {
    test.equal(solr.getStatus(res), 0);
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

