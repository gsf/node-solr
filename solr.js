var http = require("http");
var libxml = require("libxmljs");
var sys = require("sys");

// callback || noop borrowed from node/lib/fs.js
function noop () {};

var Client = function (host, port, core) {
  this.host = host || "127.0.0.1";
  this.port = port || "8983";
  this.core = core;
  if (this.core === undefined) {
    this.queryPath = "/solr/select?";
  } else {
    this.queryPath = "/solr/" + this.core + "/select?";
  }
  if (this.core === undefined) {
    this.updatePath = "/solr/update";
  } else {
    this.updatePath = "/solr/" + this.core + "/update";
  }
  this.fullHost = this.host + ":" + this.port;
  this.queryRequestOptions = function (query) {
    var options = {
      method: "GET",
      path: this.queryPath + query,
      headers: {
        "Host": this.fullHost
      }
    };
    return options;
  };
  this.updateRequestOptions = function (data) {
    var options = {
      method: "POST",
      path: this.updatePath,
      headers: {
        "Content-Length": data.length, 
        "Host": this.fullHost
      },
      data: data,
    };
    return options;
  };
};

Client.prototype.add = function (doc, options, callback) {
  var addParams = {};
  if (options.overwrite !== undefined) {
    addParams["overwrite"] = Boolean(options.overwrite);
  }
  if (options.commitWithin !== undefined) {
    addParams["commitWithin"] = options.commitWithin;
  }
  var xmldoc = new libxml.Document(function (n) {
    n.node("add", addParams, function (n) {
      n.node("doc", function (n) {
        for (field in doc) {
          n.node("field", {name: field}, doc[field]);
        }
      });
    });
  });
  var data = xmldoc.toString();
  var requestOptions = this.updateRequestOptions(data);
  this.sendRequest(requestOptions, callback || noop);
};

Client.prototype.commit = function (options, callback) {
  var data = "<commit/>";
  var requestOptions = this.updateRequestOptions(data);
  this.sendRequest(requestOptions, callback || noop);
};

Client.prototype.del = function (id, query, callback) {
  var xmldoc = new libxml.Document(function (n) {
    n.node("delete", function (n) {
      if (id) {
        if (id.constructor === Array) {
          for (var i=0; i<id.length; i++) {
            n.node("id", id[i]);
          }
        } else {
          n.node("id", id);
        }
      }
      if (query) {
        if (query.constructor === Array) {
          for (var i=0; i<query.length; i++) {
            n.node("query", query[i]);
          }
        } else {
          n.node("query", query);
        }
      }
    });
  });
  var data = xmldoc.toString();
  var requestOptions = this.updateRequestOptions(data);
  this.sendRequest(requestOptions, callback || noop);
};

Client.prototype.optimize = function (options, callback) {
  var data = "<optimize/>";
  var requestOptions = this.updateRequestOptions(data);
  this.sendRequest(requestOptions, callback || noop);
};

Client.prototype.rawQuery = function (query, callback) {
  var requestOptions = this.queryRequestOptions(query);
  this.sendRequest(requestOptions, callback || noop);
};

Client.prototype.rollback = function (options, callback) {
  var data = "<rollback/>";
  var requestOptions = this.updateRequestOptions(data);
  this.sendRequest(requestOptions, callback || noop);
};

exports.getStatus = function (statusMessage) {
  var doc = libxml.parseXmlString(statusMessage);
  return doc.get("//int[@name='status']").text();
};

exports.getError = function (errorMessage) {
  var doc = libxml.parseHtmlString(errorMessage);
  return doc.get("//pre").text();
};

exports.createClient = function (host, port, core) {
  var client = new Client(host, port, core);
  client.httpClient = http.createClient(client.port, client.host);
  client.httpClient.addListener("error", function (e) {
    throw "Unable to connect to Solr";
  });
  client.sendRequest = function (options, callback) {
    var request = this.httpClient.request(
        options.method.toUpperCase(), 
        options.path,
        options.headers
    );
    var buffer = '';
    request.addListener("response", function (response) {
      //sys.puts(response.statusCode);
      //sys.p(response.headers);
      response.addListener("data", function (chunk) {
        buffer += chunk;
      });
      response.addListener("end", function () {
        if (response.statusCode !== 200) {
          var err = exports.getError(buffer);
          callback(err, null);
        } else {
          callback(null, buffer);
        }
      });
    });
    if (options.data) {
      request.write(options.data, options.requestEncoding || 'utf8');
    }
    request.close();
  };
  return client;
};


