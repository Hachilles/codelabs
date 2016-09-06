'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);

app.use(function (req, res, next) {
  var nodeSSPI = require('node-sspi');
  var nodeSSPIObj = new nodeSSPI({
    retrieveGroups: true
  });
  nodeSSPIObj.authenticate(req, res, function(err){
    res.finished || next();
  });
});
app.use('/test', function (req, res, next) {
	if(req.connection.user)
		res.send('User Authenticated :' + req.connection.user);
	else{
		res.send('User not Authenticated :' + req.connection.user);
	}
});
app.use(function (req, res, next) {
  var out = 'Hello ' + req.connection.user + '! You belong to following groups:<br/><ul>';
  console.log(req.connection);
  if (req.connection.userGroups) {
    for (var i in req.connection.userGroups) {
      out += '<li>'+ req.connection.userGroups[i] + '</li><br/>\n';
    }
  }
  out += '</ul>';
  res.send(out);
});

// Start server
var port = process.env.PORT || 2000;
server.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});