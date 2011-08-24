var http = require("http");
var querystring = require("querystring");
var util = require('util');
var events = require('events');

// callback || noop borrowed from node/lib/fs.js
function noop() {};

var Client = function(host, port, core, path) {
  this.host = host || "127.0.0.1";
  this.port = port || "8983";
  this.fullHost = this.host + ":" + this.port;
  this.core = core || ""; // if defined, should begin with a slash
  this.path = path || "/solr"; // should also begin with a slash
};

util.inherits(Client, events.EventEmitter);

Client.prototype.add = function(doc, options, callback) {
  if (callback === undefined) {
    callback = options;
    options = {};
  }
  options = options || {};
  var addParams = {};
  if (options.overwrite !== undefined) {
    addParams["overwrite"] = Boolean(options.overwrite);
  }
  if (options.commitWithin !== undefined) {
    addParams["commitWithin"] = options.commitWithin;
  }
  if (options.commit !== undefined) {
    addParams["commit"] = Boolean(options.commit);
  }
  var data = "<add>";
  var docs = Array.isArray(doc) ? doc : [doc];
  for (var i = 0; i < docs.length; i++) {
    data += "<doc>";
    var doc = docs[i];
    for (field in doc) if (doc.hasOwnProperty(field)) {
      value = doc[field];
      if (!Array.isArray(value)) {
        data += serializeScalar(field, value);
      } else {
        data += serializeList(field, value);
      }
    }
    data += "</doc>";
  }
  data += "</add>";
  this.update(data, callback);
};

Client.prototype.commit = function(callback) {
  var data = "<commit/>";
  this.update(data, callback);
};

Client.prototype.del = function(id, query, callback) {
  var data = "<delete>";
  if (id) {
    if (Array.isArray(id)) {
      for (var i=0; i<id.length; i++) {
        data = data + "<id>" + id[i] + "</id>";
      }
    } else {
      data = data + "<id>" + id + "</id>";
    }
  }
  if (query) {
    if (Array.isArray(query)) {
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

Client.prototype.optimize = function(callback) {
  var data = "<optimize/>";
  this.update(data, callback);
};

Client.prototype.query = function(query, options, callback) {
  if (callback === undefined) {
    callback = options;
    options = {};
  }
  var queryParams = options || {};
  queryParams.q = query;
  queryParams.wt = "json";
  this.get("select?" + querystring.stringify(queryParams), callback);
};

Client.prototype.rollback = function(callback) {
  var data = "<rollback/>";
  this.update(data, callback);
};

Client.prototype.update = function(data, callback) {
  return this.post("update", data, callback);
};

Client.prototype.get = function(getPath, callback) {
  var options = {
    method: "GET",
    path: this.path + this.core + "/" + getPath,
    headers: {
      "Host": this.fullHost
    }
  };
  this.sendRequest(options, callback || noop);
};

Client.prototype.post = function(postPath, data, callback) {
  var options = {
    method: "POST",
    path: this.path + this.core + "/" + postPath,
    headers: {
      "Content-Length": Buffer.byteLength(data),
      "Host": this.fullHost
    },
    data: data
  };
  this.sendRequest(options, callback || noop);
};

// parse status from xml response
exports.getStatus = function(statusMessage) {
  if (!statusMessage) {
    return 1;
  }
  var statusTag = '<int name="status">';
  return statusMessage.charAt(statusMessage.indexOf(statusTag) +
      statusTag.length);
};

// parse error from html response
exports.getError = function(errorMessage) {
  var err = errorMessage.match(/<pre>([\s\S]+)<\/pre>/);
  return (err || ['', errorMessage])[1].trim();
};

// escape dangerous characters in query values
exports.valueEscape = function(query) {
  return query.replace(/\\?([&|+\-!(){}[\]^"~*?\:]{1})/g, function(str, c) {
    return '\\' + c;
  });
}

// main export function
exports.createClient = function(host, port, core, path) {
  var client = new Client(host, port, core, path);
  client.sendRequest = function(options, callback) {
    var requestOptions = {
      host: client.host,
      port: client.port,
      method: options.method.toUpperCase(),
      path: options.path,
      headers: options.headers
    };
    var buffer = '';
    var request = http.request(requestOptions, function(response) {
      response.on("data", function(chunk) {
        buffer += chunk;
      });
      response.on("end", function() {
        if (response.statusCode !== 200) {
          var err = new Error(exports.getError(buffer));
          callback(err);
        } else {
          callback(null, buffer);
        }
      });
    });
    request.on('error', function (e) {
            client.emit('error', e);
            callback(e);
    });
    if (options.data) {
      request.write(options.data, options.requestEncoding || 'utf8');
    }
    request.end();
  };
  return client;
};


// Helper functions

var escapeXml = function(str) {
  return str.replace(/&/gm, '&amp;')
            .replace(/</gm, '&lt;')
            .replace(/>/gm, '&gt;')
            .replace(/\'/gm, '&apos;')
            .replace(/\"/gm, '&quot;');
};

var serializeScalar = function(field, value) {
  value = '' + value;
  return '<field name = "' + field + '">' + escapeXml(value) + '</field>';
};

var serializeList = function(field, list) {
  var data = '';
  list.forEach(function(value) {
    if (!Array.isArray(value)) {
      data += serializeScalar(field, value);
    }
  });
  return data;
};
