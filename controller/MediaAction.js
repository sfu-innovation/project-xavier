var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');

// Accent
var MediaFile = require('../models/mediafile.js');

// Presenter
//var queryES = require('./queryES.js');
//var question = require('../models/question.js');
//var comment = require('../models/comment.js');
		
var MediaAction = function() {	
}

/*

Adding a mediafile based on a user specified properties.

args = {
	user		: <user id from the User model>	
	target		: <id that links between Tag and MediaFile - primary key>
	title			: <mediafile title>
	path			: <the url path of a mediafile>
	type			: <type of mediafile (not yet determined)>
}

*/

MediaAction.prototype.addMediaFile = function( args, callback ){	 
	MediaFile.createMediaFile(args, function(error, newMediaFile){		
		if (!error) {
			callback(null, newMediaFile);	
		}
		else {
			callback(error, null);
		}
		
	})	
}

/*

View all mediafiles based on a user specified properties.

args = {
	user		: <user id from the User model>	
	target		: <id that links between Tag and MediaFile - primary key>
	title			: <mediafile title>
	path			: <the url path of a mediafile>
	type			: <type of mediafile (not yet determined)>
}

TO-DO: Maybe it would be beneficial to sort the mediafiles based on the properties.
*/

MediaAction.prototype.viewMedia = function( args, callback ){ 
	MediaFile.selectMediaFiles(args, function(error, tags){		
		if (!error) {
			callback(null, tags);	
		}
		else {
			callback(error, null);
		}
		
	})
}


/*

Get a tagged mediafile that belongs to a specific tag.

args = {	
	target		: <target id from the Tag model>	
}

*/

MediaAction.prototype.getMediaFileTags = function( args, callback ){ 	
	MediaFile.getMediaFileTags(args, function(error, mediaFileTags){		
		if (!error) {
			callback(null, mediaFileTags);	
		}
		else {
			callback(error, null);
		}
		
	})	
}

/*

Get a mediafile that belongs to a user.

args = {	
	user		: <user id from the User model>	
}

*/
MediaAction.prototype.getMediaFileUser = function( args, callback ){ 	
	MediaFile.getMediaFileUser(args, function(error, mediaFileUser){		
		if (!error) {
			callback(null, mediaFileUser);	
		}
		else {
			callback(error, null);
		}
		
	})	
}

/*

Update a specific mediafile based on a target.

args = {
	target		: <id that links between Tag and MediaFile - primary key>

	allowed field: 
		user		: <user id from the User model>		
		title			: <mediafile title>
		path			: <the url path of a mediafile>
		type			: <type of mediafile (not yet determined)>	
}

*/

MediaAction.prototype.updateMediaFile = function( target, args, callback ){ 	
	MediaFile.updateMediaFile(target, args, function(error, updatedMediaFile){		
		if (!error) {
			callback(null, updatedMediaFile);	
		}
		else {
			callback(error, null);
		}
		
	})	
}

/*

Delete a specific media file based on a target.

args = {
		target		: <target id that links between Tag and MediaFile will work the best>
}

*/

MediaAction.prototype.deleteMediaFile = function( args, callback ){ 	
	MediaFile.deleteMediaFile( args, function(error, deletedMediaFile){		
		if (!error) {
			callback(null, deletedMediaFile);	
		}
		else {
			callback(error, null);
		}		
	})	
}

var object = {
		//"type":12	
		'target':'abc1232'
		//'user':'BSDF787D98A7SDF8ASD7G'
  };

var mediaAction = new MediaAction();
/*
mediaAction.getMediaFileTags(object, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - "+ data);
		for(i=0; i<data.length; ++i){
			console.log(data[i].title);
		}
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/

var newMediaFile = {
	user:"A7S7F8GA7SD98A7SDF8ASD7G",				
	title:"How to make buble tea",
	path:"http://www.youtube.com/bt",
	type:1
};

var updatedMediaFile = {
	'title':'torfino kick', 
	'path':'www.torfino.com'
};

/*
mediaAction.viewMedia(object, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - ");
		for(i=0; i<data.length; ++i){
			console.log(data[i].title + ' ' + data[i].path);
		}
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/

/*
mediaAction.getMediaFileTags(object, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - ");
		for(i=0; i<data.length; ++i){
			console.log(data[i].title + ' ' + data[i].description);
		}
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/

/*
mediaAction.getMediaFileUser(object, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - " + data.firstName + ' ' + data.lastName);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/

/*
mediaAction.addMediaFile(newMediaFile, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - "+ data);
		for(i=0; i<data.length; ++i){
			console.log(data[i].title);
		}
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/

/*
mediaAction.updateMediaFile(object, updatedMediaFile, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - "+ data.title + ' ' + data.path);
	} else {
		console.log( "[ERROR] - "+ err);
	}
});
*/

/*
mediaAction.deleteMediaFile(object, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - " + data);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/

module.exports = new MediaAction;