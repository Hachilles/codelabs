var express = require('express')
, http = require('http')
, expressSession = require('express-session')
, ntlm = require('express-ntlm');


var app = express();
//app.listen(1002);
app.use(expressSession({ resave: false,
	saveUninitialized: true,
	secret: 'ntlm-test' }));


var allow_cross_domain= function(req, res, next) {
    res.header('X-Powered-By', 'hey.heyssssssss.org');

    var oneof = false;
    if(req.headers.origin) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      oneof = true;
    }
    if(req.headers['access-control-request-method']) {
      res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
      oneof = true;
    }
    if(req.headers['access-control-request-headers']) {
      res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
      oneof = true;
    }
    if(oneof) {
      res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }
  // intercept OPTIONS method
  if (oneof && req.method == 'OPTIONS') {
    res.send(200);
  } else {
	  console.log('Test 1');
    next();
  }
  }

  app.use(allow_cross_domain);

app.use('/', ntlm());
app.all('*', function(request, response) {
	console.log('Test 2');
    response.end(JSON.stringify(request.ntlm)); // {"DomainName":"MYDOMAIN","UserName":"MYUSER","Workstation":"MYWORKSTATION"}
});
app.get('/', function(request, response) {
    console.log(request.ntml) // { target: 'MYDOMAIN', userid: 'MYUSERID', workstation: 'MYWORKSTATION' }
    response.send("{'result':'success'}");
});

http.createServer(app).listen(1002 , function () {
	console.log('Express server listening on port ' +app.get('ip') + ":" + app.get('port'));

});