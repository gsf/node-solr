var asyncTesting = require("async_testing");
var solr = require("../solr");

var suite = new asyncTesting.TestSuite();
suite.setup(function () {
  this.client = solr.createClient();
});
suite.addTests({
  add1: function (assert, finished) {
    var doc = {
      id: "1",
      fizzbuzz_t: "foo",
      wakak_i: "5"
    };
    var options = {};
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.add(doc, options, callback);
  },
  add2: function (assert, finished) {
    var doc = {
      id: 2,
      fizzbuzz_t: "bar",
      wakak_i: 5
    };
    var options = {};
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.add(doc, options, callback);
  },
  addUnicode: function (assert, finished) {
    var doc = {
      id: 3,
      fizzbuzz_t: "bar",
      unimath_t: "½ + ¼ = ¾"
    };
    var options = {};
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.add(doc, options, callback);
  },
  delById: function (assert, finished) {
    var id = 1;
    var query = null;
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.del(id, query, callback);
  },
  delByQuery: function (assert, finished) {
    var id = null;
    var query = "fizzbuzz_t:bar";
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.del(id, query, callback);
  },
  addNoId: function (assert, finished) {
    var doc = {
      fizzbuzz_t: "foo",
      wakak_i: "5",
    };
    var options = {};
    var callback = function (err, response) {
      assert.equal(err, "Document [null] missing required field: id");
      finished();
    };
    this.client.add(doc, options, callback);
  },
  commit: function (assert, finished) {
    var options = {};
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.commit(options, callback);
  },
  add3: function (assert, finished) {
    var doc = {
      id: "3",
      fizzbuzz_t: "fizz",
      wakak_i: "5"
    };
    var options = {};
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.add(doc, options, callback);
  },
  rollback: function (assert, finished) {
    var options = {};
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.rollback(options, callback);
  },
  optimize: function (assert, finished) {
    var options = {};
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.optimize(options, callback);
  }
});

exports.updateSuite = suite;

if (module === require.main) {
  asyncTesting.runSuites(exports);
}
