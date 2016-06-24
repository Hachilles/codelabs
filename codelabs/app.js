

/**
 * Module dependencies.
 self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
 self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
 */

var compression = require('compression')
, express = require('express')
, expressSession = require('express-session')
, mongoose = require('mongoose')
, routes = require('./routes')
, models = require('./schema/models')(mongoose)
, http = require('http')
, path = require('path')
, logger = require('morgan')
, bodyParser = require('body-parser')
, favicon = require('serve-favicon');

/* Global variables */
global.root = process.env.DOC_ROOT || __dirname + "/content/"
var app = express();


app.use(expressSession({ resave: false,
	saveUninitialized: true,
	secret: 'citi-editor-test' }));

//all environments
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 1000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('combined'))

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(compression());


app.use(express.static(path.join(__dirname, 'bower_components/dist')));
app.use("/components", express.static(path.join(__dirname, 'bower_components')));
app.use("/node_modules", express.static(path.join(__dirname, 'node_modules')));

//development only
if ('development' == app.get('env')) {
	//app.use(express.errorHandler());
}

var connection_string = 'mongodb://127.0.0.1:27017/code_labs';
//if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
	connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
	process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
	process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
	process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
	process.env.OPENSHIFT_APP_NAME;
}
var db = mongoose.connect('mongodb://' + connection_string);


app.get('/', routes.index);
app.post('/saveDocContent', function(req, res){
	console.log("req.body.pageId ::" + req.body.pageId);
	var id = mongoose.Types.ObjectId(req.body.pageId);
	var q = models.PageDetails.findById(id, function(err, data){
		if(data){
			data.content = req.body.content;
			data.updatedDate = Date.now();
			data.save(function (err, fluffy) {
				  if (err) {
					  res.send('{"result":"Error"}');
					 console.error(err);
				  }
			});
			res.send('{"result":"Success"}');
		}else{
			res.send('{"result":"Error"}');
		}

	});
});

app.post('/loadDocContent', function(req, res){
	var pageId = req.body.pageId;
	if(pageId){
		var id = mongoose.Types.ObjectId(pageId);
		var q = models.PageDetails.findById(id, function(err, data){
			res.send(data);
		});
	}
});

app.post('/load_doc_left_panel', function(req, res){
	
	models.PageDetails.find(
			{"docInfoId": req.body.docId}
	).sort({ page_position: 1 })
	.select({ _id: 1, title: 1 })
	.exec(function(err, data){
		  if (err) {
			  res.send('{"result":"ERROR"}');
		  }else{
			  res.send(data);
		  }
	});
});
app.get('/load_main_left_panel', function(req, res){
	models.Groups.find({}, function(err, data){
		res.send(data);
	});
});
app.post('/load_main_panel', function(req, res){
	console.log( req.body);
	console.log('%s - %s ', req.body.groupID, req.body.category);
	models.DocumentInfo.find({groupID:req.body.groupID, category:req.body.category}).exec(function(err, data){
		res.send(data);
	});
});

app.post('/addNewDoc', function(req, res){
		console.log(req.body);
		var documentInfo = new models.DocumentInfo(req.body);
		documentInfo.save();
		res.send('{"result":"OK"}');
	
});
app.post('/addNewGroupItem', function(req, res){
		console.log(req.body);
		var id = mongoose.Types.ObjectId(req.body.groupID);
		models.Groups.findById(id, function(err, data){
			if(err){
				res.send('{"result":"ERROR"}');
			}else{
				if(data.categories){
					data.categories.push(req.body.groupItem);
				}else{
					data.categories = [req.body.groupItem];
				}
				data.save();
			}
		})
		res.send('{"result":"OK"}');
});
app.post('/addNewGroup', function(req, res){
		console.log(req.body);
		var group = new models.Groups(req.body);
		group.save(function(err, data){
			if(err){
				res.send('{"result":"ERROR"}');
			}
		});
		res.send('{"result":"OK"}');
	
});
app.post('/deleteDoc', function(req, res){
	var doc_id = mongoose.Types.ObjectId(req.body.doc_id);
	models.DocumentInfo.findByIdAndRemove(doc_id, function (err,doc){
		if(err){
			res.send('{"Result" : "ERROR"}');
		}else{
			res.send('{"Result" : "OK"}');
		}
	});
});

app.post('/editDoc', function(req, res){
	console.log(req.body);
	req.session.groupID = req.body.groupID;
	req.session.doc_id = req.body.doc_id;
	req.session.save();
	res.send('{"Result" : "Success"}');
});
app.get('/viewDoc', function(req, res){
	req.session.doc_id = req.param('doc_id');
	req.session.save();
	res.send('{"Result" : "Success"}');
});

app.post('/createNewPage', function(req, res){
	console.log(req.body);
	var pos = req.body.page_position;
	var pd = new models.PageDetails(req.body);
	pd.content = '<div id="content"><h2 style="text-align:center">'+ req.body.title +'</h2></div>';
	
	models.PageDetails.update({page_position:{ $gte:pos} }, {$inc: {page_position:1}},{multi: true},
			function(err, num){
				console.log('Number of docs updated :' + num);
				pd.save();
				res.send(pd);
	});
});
app.post('/editPage', function(req, res){
	var pageId = mongoose.Types.ObjectId(req.body.pageId);
	var _title = req.body.title;
	var posUpdateInfo = req.body.posUpdateInfo;
	if(posUpdateInfo.stPos && posUpdateInfo.enPos){
	models.PageDetails.update({page_position:{ $gte:posUpdateInfo.stPos, $lte:posUpdateInfo.enPos} }, {$inc: {page_position:posUpdateInfo.incVal}},{multi: true},
			function(err, num){
				if(!err){
					models.PageDetails.update({_id:pageId }, {title: _title, page_position : posUpdateInfo.newPos},
							function(err, data){
								if(err){
									console.log(err);
									res.send('{"Result" : "ERROR"}');
								}else{
									res.send('{"Result" : "OK"}');
								}
							});
				 }
				else{
					console.log(err);
				}
			});
	}else{
		models.PageDetails.update({_id:pageId }, {title: _title},
				function(err, data){
					res.send('{"Result" : "OK"}');
				});
	}
});
app.post('/deletePage', function(req, res){
	var pageId = mongoose.Types.ObjectId(req.body.pageId);
	models.PageDetails.findByIdAndRemove(pageId, function (err,page){
		console.log(page);
		if(err){
			res.send('{"Result" : "ERROR"}');
		}else{
			var pos = page.page_position;
			models.PageDetails.update({page_position:{ $gte:pos} }, {$inc: {page_position:-1}},{multi: true},
			function(err, num){
				res.send('{"Result" : "OK"}');
			});
			
		}
	});
});

app.post('/fileUpload', routes.fileUpload);
app.post('/deleteImg', routes.deleteImg);


http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' +app.get('ip') + ":" + app.get('port'));
	console.log('Running in ' + app.get('env') + ' mode');
	console.log('DOC_ROOT: ' + root);
	console.log('connection string : ' + connection_string);

});
