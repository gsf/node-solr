# Solr module for Node.js

## References
* Node.js: http://github.com/joyent/node
* Solr: http://lucene.apache.org/solr/

Run tests with `npm test`. Edit "test/common.js" if you don't have Solr running at 127.0.0.1:8983. 

## Usage Example

See tests for usage. Here's a quick example:

```javascript
    var solr = require('solr');

    var client = solr.createClient();
    var doc1 = {
      id: '1',
      title_t: 'Foo bar',
      text_t: 'Fizz buzz frizzle'
    };
    var doc2 = {
      id: '2',
      title_t: 'Far boo',
      text_t: 'Wuzz fizz drizzle'
    };

    client.add(doc1, function(err) {
      if (err) throw err;
      console.log('First document added');
      client.add(doc2, function(err) {
        if (err) throw err;
        console.log('Second document added');
        client.commit(function(err) {
          var query = 'text_t:fizz'
          client.query(query, function(err, response) {
            if (err) throw err;
            var responseObj = JSON.parse(response);
            console.log('A search for "' + query + '" returned ' +
                responseObj.response.numFound + ' documents.');
            console.log('First doc title: ' + 
                responseObj.response.docs[0].title_t);
            console.log('Second doc title: ' + 
                responseObj.response.docs[1].title_t);
            client.del(null, query, function(err, response) {
              if (err) throw err;
              console.log('Deleted all docs matching query "' + query + '"');
              client.commit()
            });
          });
        });
      });
    });
```

## Optional Parameters

Solr add/replace documents supports optional parameters.

```javascript
var doc1 = {
  id: '1',
  title_t: {
    params: {
      boost: '2.0'
    },
    value: 'Foo bar',
  },
  text_t: 'Fizz buzz frizzle'
};
```