var asyncTesting = require("async_testing");
var solr = require("../solr");
var sys = require("sys");

var suite = new asyncTesting.TestSuite();
suite.setup(function () {
  this.client = solr.createClient();
  var doc = {
    id: "1",
    fizzbuzz_t: "foo",
    wakak_i: "5",
    bar_t: "11:15 is 11:00 + 15 minutes"
  };
  this.client.add(doc);
  this.client.commit();
});
suite.teardown(function () {
  var id = "1";
  this.client.del(id);
  this.client.commit();
});
suite.addTests({
  query: function (assert, finished, test) {
    var query = "wakak_i:5";
    var callback = function (err, response) {
      assert.equal(JSON.parse(response).response.numFound, 1);
      finished();
    };
    test.client.query(query, callback);
  },
  rawQuery: function (assert, finished, test) {
    var queryParams = "q=fizzbuzz_t:foo"
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    test.client.rawQuery(queryParams, callback);
  },
  errorQuery: function (assert, finished, test) {
    var query = "bob:poodle";
    var callback = function (err, response) {
      assert.equal(err, "undefined field bob");
      finished();
    };
    test.client.query(query, callback);
  },
  unescapedValue: function (assert, finished, test) {
    var query = "bar_t:11:15";
    var callback = function (err, response) {
      assert.ok(err);
      finished();
    };
    test.client.query(query, callback);
  },
  escapedValue: function (assert, finished, test) {
    var query = "bar_t:" + solr.valueEscape("11:00 + 15");
    var callback = function (err, response) {
      assert.equal(JSON.parse(response).response.numFound, 1);
      finished();
    };
    test.client.query(query, callback);
  }
});

exports.querySuite = suite;

if (module === require.main) {
  asyncTesting.runSuites(exports);
}

