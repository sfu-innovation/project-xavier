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
	user_uid		: <user id from the User model>	
	target_uuid		: <id that links between Tag and MediaFile - primary key>
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

MediaAction.prototype.updateMediaFile = function( target_uuid, args, callback ){ 	
	MediaFile.updateMediaFile(target_uuid, args, function(error, updatedMediaFile){		
		if (!error) {
			callback(null, updatedMediaFile);	
		}
		else {
			callback(error, null);
		}
		
	})	
}

var object = {
		//"type":12	
		'target_uuid':'abc1232'
		//'user_uid':'BSDF787D98A7SDF8ASD7G'
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
	user_uid:"A7S7F8GA7SD98A7SDF8ASD7G",				
	title:"How to make buble tea",
	path:"http://www.youtube.com/bt",
	type:1
};

var updatedMediaFile = {
	'title':'torfino kick', 
	'path':'www.torfino.com'
};
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

mediaAction.updateMediaFile(object, updatedMediaFile, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - "+ data.title + ' ' + data.path);
	} else {
		console.log( "[ERROR] - "+ err);
	}
});