var http = require('http');
var url = require('url');
var request = require('request');
var cors = require('cors');
http.createServer(onRequest).listen(8080);


function onRequest(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
  	res.setHeader('Access-Control-Request-Method', '*');
  	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  	res.setHeader('Access-Control-Allow-Headers', '*');


  	if ( req.method === 'OPTIONS' ) {
  		res.writeHead(200);
  	}

    var d = new Date().toLocaleString();

    var queryData = url.parse(req.url, true).query;
    console.log(d+" Proxify : "+queryData.url);
    if (queryData.url) {
        request({
            url: queryData.url
        }).on('error', function(e) {
            console.log("                            ------------> ERROR");
            res.end(e);
        }).pipe(res);
    }
    else {
        res.end("no url found");
    }
}
