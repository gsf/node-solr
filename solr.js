var http = require("http");
var querystring = require("querystring");

// callback || noop borrowed from node/lib/fs.js
function noop () {};

var Client = function (host, port, core) {
  this.host = host || "127.0.0.1";
  this.port = port || "8983";
  this.fullHost = this.host + ":" + this.port;
  this.core = core;
};

Client.prototype.add = function (doc, options, callback) {
  options = options || {};
  var addParams = {};
  if (options.overwrite !== undefined) {
    addParams["overwrite"] = Boolean(options.overwrite);
  }
  if (options.commitWithin !== undefined) {
    addParams["commitWithin"] = options.commitWithin;
  }
  var data = "<add><doc>";
  for (field in doc) {
    data = data + '<field name = "' + field + '">' + doc[field] + '</field>';
  }
  data = data + "</doc></add>";
  this.update(data, callback);
};

Client.prototype.commit = function (options, callback) {
  var data = "<commit/>";
  this.update(data, callback);
};

Client.prototype.del = function (id, query, callback) {
  var data = "<delete>";
  if (id) {
    if (id.constructor === Array) {
      for (var i=0; i<id.length; i++) {
        data = data + "<id>" + id[i] + "</id>";
      }
    } else {
      data = data + "<id>" + id + "</id>";
    }
  }
  if (query) {
    if (query.constructor === Array) {
      for (var i=0; i<query.length; i++) {
        data = data + "<query>" + query[i] + "</query>";
      }
    } else {
      data = data + "<query>" + query + "</query>";
    }
  }
  data = data + "</delete>";
  this.update(data, callback);
};

Client.prototype.optimize = function (options, callback) {
  var data = "<optimize/>";
  this.update(data, callback);
};

Client.prototype.query = function (query, options, callback) {
  var queryParams = options || {};
  queryParams.q = query;
  queryParams.wt = "json";
  queryParams = querystring.stringify(queryParams);
  this.rawQuery(queryParams, callback);
};

Client.prototype.rawQuery = function (queryParams, callback) {
  var queryPath, requestOptions;
  if (this.core === undefined) {
    queryPath = "/solr/select?";
  } else {
    queryPath = "/solr/" + this.core + "/select?";
  }
  requestOptions = {
    method: "GET",
    path: queryPath + queryParams,
    headers: {
      "Host": this.fullHost
    }
  };
  this.sendRequest(requestOptions, callback || noop);
};

Client.prototype.rollback = function (options, callback) {
  var data = "<rollback/>";
  this.update(data, callback);
};

Client.prototype.update = function (data, callback) {
  var updatePath, requestOptions;
  if (this.core === undefined) {
    updatePath = "/solr/update";
  } else {
    updatePath = "/solr/" + this.core + "/update";
  }
  requestOptions = {
    method: "POST",
    path: updatePath,
    headers: {
      "Content-Length": Buffer.byteLength(data), 
      "Host": this.fullHost
    },
    data: data,
  };
  this.sendRequest(requestOptions, callback || noop);
};

exports.getStatus = function (statusMessage) {
  if (!statusMessage) {
    return 1;
  }
  var statusTag = '<int name="status">';
  return statusMessage.charAt(statusMessage.indexOf(statusTag) + 
      statusTag.length);
};

exports.getError = function (errorMessage) {
  return errorMessage.match(/<pre>([\s\S]+)<\/pre>/)[1];
};

exports.valueEscape = function (query) {
  return query.replace(/\\?([&|+\-!(){}[\]^"~*?\:]{1})/g, function(str, c) {
    return '\\' + c;
  });
}

exports.createClient = function (host, port, core) {
  var client = new Client(host, port, core);
  client.httpClient = http.createClient(client.port, client.host);
  client.sendRequest = function (options, callback) {
    var request = this.httpClient.request(options.method.toUpperCase(), 
      options.path, options.headers);
    if (options.data) {
      request.write(options.data, options.requestEncoding || 'utf8');
    }
    request.end();
    var buffer = '';
    request.on("response", function (response) {
      response.on("data", function (chunk) {
        buffer += chunk;
      });
      response.on("end", function () {
        if (response.statusCode !== 200) {
          var err = exports.getError(buffer);
          callback(err, null);
        } else {
          callback(null, buffer);
        }
      });
    });
  };
  return client;
};


