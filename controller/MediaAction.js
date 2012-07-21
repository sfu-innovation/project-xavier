var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');

// Accent
var MediaFile = require('../models/mediafile.js');

var MediaAction = function() {	
}

/*

Adding a mediafile based on a user specified properties.

args = {
 	uuid		: <MediaFile uuid - primary key>
	user		: <user uuid from the User model>	
	title			: <mediafile title>
	path			: <the url path of a mediafile>
	type			: <type of mediafile (not yet determined)>
}

*/

MediaAction.prototype.addMediaFile = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}

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

Get a media file based on a media file id.

args = {
	uuid			: <MediaFile uuid - primary key>
}

TO-DO: Maybe it would be beneficial to sort the mediafiles based on the properties.
*/


MediaAction.prototype.getMediaFileById = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = args.hasOwnProperty('uuid');
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

	MediaFile.selectMediaFile(args, function(error, tags){
		if (!error) {
			callback(null, tags);
		}
		else {
			callback(error, null);
		}

	})
}

// Fetches all the media files uploaded for a certain course
MediaAction.prototype.getMediaByCourse = function(courseID, callback){
	MediaFile.selectMediaFiles({course: courseID}, function(error, mediaFiles){
		if(!error){
			callback(null, mediaFiles);
		}
		else{
			callback(error, null);
		}
	})
}

/*

View all mediafiles based on a user specified properties.

args = {
	uuid			: <MediaFile uuid - primary key>
	user			: <user uuid from the User model>
	type			: <type of mediafile (not yet determined)>
}

TO-DO: Maybe it would be beneficial to sort the mediafiles based on the properties.
*/

MediaAction.prototype.viewMedia = function( args, callback ){ 
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('uuid') || args.hasOwnProperty('user') ||
		args.hasOwnProperty('type'));
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

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
	uuid		: <mediafile uuid>
}

*/

MediaAction.prototype.getMediaFileTags = function( args, callback ){ 
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = args.hasOwnProperty('uuid');
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

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
	user		: <user uuid from the User model>	
}

*/
MediaAction.prototype.getMediaFileUser = function( args, callback ){ 
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = args.hasOwnProperty('user');
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

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

Update a specific mediafile based on a uuid.

args = {
 		uuid			: <MediaFile uuid - primary key>

	allowed field: 
		user			: <user uuid from the User model>		
		title			: <mediafile title>
		path			: <the url path of a mediafile>
		type			: <type of mediafile (not yet determined)>	
}

*/

MediaAction.prototype.updateMediaFile = function( uuid, args, callback ){	
	if ( uuid === null || uuid === undefined ){		
		callback("UUID is not existent", null);
		return;
	}

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}

	MediaFile.updateMediaFile(uuid, args, function(error, updatedMediaFile){
		if (!error) {
			callback(null, updatedMediaFile);	
		}
		else {
			callback(error, null);
		}
		
	})	
}

/*

Delete a specific media file based on a uuid.

args = {
 	uuid		: <MediaFile uuid - primary key>
}

*/

MediaAction.prototype.deleteMediaFile = function( args, callback ){
	/*
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = args.hasOwnProperty('uuid');
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	*/

	MediaFile.deleteMediaFile( args, function(error, deletedMediaFile){		
		if (!error) {
			callback(null, deletedMediaFile);	
		}
		else {
			callback(error, null);
		}		
	})	
}

module.exports = new MediaAction;