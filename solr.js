var http = require("http");
var libxml = require("libxmljs");
var sys = require("sys");

var Client = function (host, port, core) {
  this.host = host || "127.0.0.1";
  this.port = port || "8983";
  this.core = core;
  if (this.core === undefined) {
    this.updatePath = "/solr/update";
  } else {
    this.updatePath = "/solr/" + this.core + "/update";
  }
  this.fullHost = this.host + ":" + this.port;
};

Client.prototype.add = function (doc, options, callback) {
  var addParams = {};
  if (options.overwrite !== undefined) {
    addParams["overwrite"] = Boolean(options.overwrite);
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
  var requestOptions = {
    method: "POST",
    path: this.updatePath,
    headers: {
      "Content-Length": data.length, 
      "Host": this.fullHost
    },
    data: data,
  };
  this.sendRequest(requestOptions, callback);
};

Client.prototype.commit = function (options, callback) {
  var data = "<commit/>";
  var requestOptions = {
    method: "POST",
    path: this.updatePath,
    headers: {
      "Content-Length": data.length, 
      "Host": this.fullHost
    },
    data: data,
  };
  this.sendRequest(requestOptions, callback);
};

exports.parseXml = function (xmlString) {
  return libxml.parseXmlString(xmlString);
};

exports.getStatus = function (xmlString) {
  var doc = exports.parseXml(xmlString);
  return doc.get("//int[@name='status']").text();
};

exports.getError = function (htmlString) {
  var doc = exports.parseXml(htmlString);
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


