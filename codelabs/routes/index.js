/*exports.authentication = function (req, res) {
	if(req.connection.user){
		next();
	}
	  var nodeSSPI = require('node-sspi');
	  var nodeSSPIObj = new nodeSSPI({
	    retrieveGroups: false
	  });
	  nodeSSPIObj.authenticate(req, res, function(err){
	    res.finished || next();
});
};*/
exports.index = function(req, res){
	res.redirect('/homePage.html');
};

exports.deleteImg = function(req, res){
	console.log('Actual file delete is not require');
};
exports.fileUpload = function(req, res){
	console.log('Actual file upload is not require, we have bind data URL to show the image');
};
exports.createNewPage = function(req, res){
	console.log(req.body);
	var deription = req.body.page_description;
	var input = req.body;
	var jsonfile = require('jsonfile');
	var pagesJsonFile = root + req.session.doc_folder + '/pages.json';
	console.log("from createNewPage :: pagesJsonFile ::" + pagesJsonFile);
	var fs = require('fs');
	fs.exists(pagesJsonFile, function(exists) {
		if (!exists) {
			fs.writeFile(pagesJsonFile, "[]", function(error) {
				jsonfile.readFile(pagesJsonFile, function(err, obj) {
					input.path = '1.html';
					input.target_id = '#';
					obj.push(input);
					jsonfile.writeFile(pagesJsonFile, obj, function (err) {
						fs.writeFile(root + req.session.doc_folder + '/1.html', '<div id="content"><h2 style="text-align:center">'+ input.description +'</h2></div>', function(err){
							if(err){
								  res.send('{"result":"ERROR"}');
							  }else{
								  console.log("no error");
								  res.send('{"result":"OK"}');
							  }
						});
					});
				});
			});
		}else{
			jsonfile.readFile(pagesJsonFile, function(err, obj) {
				var page = obj.length + 1;
				input.path = page + '.html';
				input.target_id = '#';
				obj.push(input);
				jsonfile.writeFile(pagesJsonFile, obj, function (err) {
					fs.writeFile(root + req.session.doc_folder + '/'+ page +'.html', '<div id="content"><h2 style="text-align:center">'+ input.description +'</h2></div>', function(err){
						if(err){
							  res.send('{"result":"ERROR"}');
						  }else{
							  console.log("no error");
							  res.send('{"result":"OK"}');
						  }
					});
				});
			});
		}
	});
};
exports.loadDocContent = function(req, res){
	var file_full_path = root + req.session.doc_folder + "/" + req.body.filename;
	console.log("from loadDocContent :: doc_root ::" + file_full_path);
	var fs = require('fs');
	fs.exists(file_full_path, function(exists) {
	    fs.readFile(file_full_path, 'utf8', function(err, data){
	    	if(err){
	    		return console.log(err);
	    	}
	    	res.send(data);
	    });
	});
};
exports.load_doc_left_panel = function(req, res){
	var jsonfile = require('jsonfile');
	var doc_root = root + req.session.doc_folder;
	console.log("from load_doc_left_panel :: doc_root ::" + doc_root);
	var fs = require('fs');
	fs.exists(doc_root, function(exists) {
		if (exists) {
			jsonfile.readFile(doc_root+ '/pages.json', function(err, obj) {
				if(!err){
					res.send(obj);
				}else{
					console.log('error while loading pages.json from ' + doc_root );
				}
			});
		}
	});
};
/*exports.load_main_left_panel = function(Categories categories){
	var post =function(req, res){
		categories.find({}, function(err, data){
			res.send(data);
		});
	}
	return post;
};*/
exports.load_main_panel = function(req, res){
	var jsonfile = require('jsonfile');
	var file = root + '/json/main_panel.json';
	console.log("from load_main_panel :: file ::" + file);
	jsonfile.readFile(file, function(err, obj) {
		if(!err){
			res.send(obj);
		}else{
			console.log('error while loading pages.json from ' + file );
		}
	});
};
exports.addNewDoc = function(req, res){
	var body = req.body;
	console.log(body);
	var jsonfile = require('jsonfile');
	var file = root +'/json/main_panel.json';
	jsonfile.readFile(file, function(err, obj) {
	var targetID = body.tagetID;
	delete body.tagetID;
	console.log ('targetID ::' + targetID);
		for(var i=0;i<obj.length;i++){
			if( obj[i].id == targetID ){
				obj[i].cards.unshift(body);
				jsonfile.writeFile(file, obj, function (err) {
					  console.error(err);
					  if(err){
						  console.log(err);
						  res.send('{"result":"ERROR"}');
					  }else{
						  console.log("no error");
						  res.send('{"result":"OK"}');
					  }
				});
			}
		}
		var folderName = body.title.split(' ').join('_');
		
		var fs = require('fs');
		fs.mkdir(root+'/'+targetID, function(exists) {});
		
		folderName = root+'/'+targetID+'/'+folderName;
		console.log('folderName ::' + folderName);
		
		fs.mkdir(folderName, function(exists) {
			console.log('exists :' + exists);
			fs.writeFile(folderName +'/pages.json', "[]", function(error) {
				fs.writeFile(folderName + '/1.html', '<div id="content"><h2 style="text-align:center">Sample page </h2></div>', function(err){
					if(err){
						console.log(err);
						  res.send('{"result":"ERROR"}');
					  }else{
						  console.log("no error");
						  res.send('{"result":"OK"}');
					  }
				});
			});
		});
	});
};
exports.saveDocContent = function(req, res){
	console.log(req.body);
	console.log(req.body.filename);
	
	var fs = require('fs');
	fs.writeFile(root + req.session.doc_folder + "/" + req.body.filename, req.body.content, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log("The file was saved!");
	}); 
	res.send('{"result":"Success"}');
};

exports.editDoc = function(req, res){
	req.session.doc_name = req.body.name;
	//console.log('req.session.doc_folder ::' + req.session.doc_folder);
	req.session.save();
	//console.log(req.session);
	//res.redirect('/editor.html');
	res.send('{"Result" : "Success"}');
};
exports.viewDoc = function(req, res){
	//req.session.doc_folder = req.body.doc_folder;
	req.session.doc_folder = req.param('doc_folder');
	console.log('req.session.doc_folder ::' + req.session.doc_folder);
	req.session.save();
	//console.log(req.session);
	res.redirect('/pageView.html');
	//res.send('{"Result" : "Success"}');
};
exports.deleteDoc = function(req, res){
	var rmdir = require( 'rmdir' );
	rmdir( root + req.body.doc_folder , function ( err, dirs, files ){
	  console.log( dirs );
	  console.log( files );
	  console.log( 'all files are removed in :' + root + req.body.doc_folder);
	  console.log(err);
	  if(!err){
		  var jsonfile = require('jsonfile');
			var file = root +'/json/main_panel.json';
			jsonfile.readFile(file, function(err, obj) {
			var elementIndex = req.body.elementIndex;
			var title = req.body.title;
			var element = obj[elementIndex].cards;
			console.log ('title ::' + title);
				for(var i=0;i<element.length;i++){
					if( element[i].title == title ){
						obj[elementIndex].cards.splice(i,1);
						console.log ('deleted  ::' + element[i]);
						jsonfile.writeFile(file, obj, function (err) {
							  console.error(err);
							  if(err){
								  res.send('{"result":"ERROR"}');
							  }else{
								  console.log("no error");
								  res.send('{"result":"OK"}');
							  }
						});
					}
				}
			});
	  }
	});
};