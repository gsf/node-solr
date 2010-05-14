var asyncTesting = require("async_testing");
var solr = require("../solr");

var suite = new asyncTesting.TestSuite();
suite.setup(function () {
  this.client = solr.createClient();
  this.client.httpClient.addListener("error", function (e) {
    throw new Error("Unable to connect to Solr");
  });
  var doc = {
    id: "1",
    fizzbuzz_t: "foo",
    wakak_i: "5"
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
  query: function (assert, finished) {
    var query = "wakak_i:5";
    var options = null;
    var callback = function (err, response) {
      assert.equal(JSON.parse(response).response.numFound, 1);
      finished();
    };
    this.client.query(query, options, callback);
  },
  rawQuery: function (assert, finished) {
    var queryParams = "q=fizzbuzz_t:foo"
    var callback = function (err, response) {
      assert.equal(solr.getStatus(response), 0);
      finished();
    };
    this.client.rawQuery(queryParams, callback);
  }
});

exports.querySuite = suite;

if (module === require.main) {
  asyncTesting.runSuites(exports);
}

