var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');

// Accent
var Tag = require('../models/tag.js');

// Presenter
var queryES = require('./queryES.js');		

var TagAction = function() {	
}

/*

Adding a tag based on a user specified properties.

args = {
	user			: <user id from the User model>,
	uuid 			: <id belonging to a tag - primary key>
	start			: <start time (seconds) of a video that user want to tag>
	end				: <end time (seconds) of a video that user want to tag>
	type			: <type of tag (not yet determined)>
	target			: <id that links between Tag and MediaFile>
	title			: <tag title>
	description		: <tag description>
	question		: <question belonging to a tag>
	important		: <boolean value of a video whether it is important>
	interest		: <boolean value of a video whether it is interesting>
	examable		: <boolean value of a video whether it is examable>
	reviewlater		: <boolean value of a video whether it is worth reviewing it later>
	shared			: <boolean value of a video whether it is shared by an instructor>
}

*/
TagAction.prototype.addTag = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') && args.hasOwnProperty('start') && 
		args.hasOwnProperty('end') && args.hasOwnProperty('type') && args.hasOwnProperty('target') &&
		args.hasOwnProperty('title') && args.hasOwnProperty('description') && args.hasOwnProperty('question') &&
		args.hasOwnProperty('important') && args.hasOwnProperty('interest') && args.hasOwnProperty('examable') &&
		args.hasOwnProperty('reviewlater') && args.hasOwnProperty('shared'));
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}
	
	Tag.createTag(args, function(error, newTag){		
		if (!error) {
			callback(null, newTag);	
		}
		else {
			callback(error, null);
		}
		
	})	
}

/*

Get a tags based on a tag id.

args = {	
	uuid 			: <id belonging to a tag>,
}

TO-DO: Maybe it would be beneficial to sort the tag based on the properties.
*/

TagAction.prototype.getTagById = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = args.hasOwnProperty('uuid');
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

	Tag.selectTag(args, function(error, tags){
		if (!error) {
			callback(null, tags);
		}
		else {
			callback(error, null);
		}

	})
}

/*

View all tags based on a user specified properties.

args = {
	user			: <user id from the User model - primary key>,
	uuid 			: <id belonging to a tag>,
	type			: <type of tag (not yet determined)>		
	important		: <boolean value of a video whether it is important>
	interest		: <boolean value of a video whether it is interesting>
	examable		: <boolean value of a video whether it is examable>
	reviewlater		: <boolean value of a video whether it is worth reviewing it later>
	shared			: <boolean value of a video whether it is shared by an instructor>
}

TO-DO: Maybe it would be beneficial to sort the tag based on the properties.
*/

TagAction.prototype.viewTags = function( args, callback ){ 
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('uuid') || args.hasOwnProperty('user') ||
		args.hasOwnProperty('type') || args.hasOwnProperty('important') || args.hasOwnProperty('interest') ||
		args.hasOwnProperty('examable') || args.hasOwnProperty('reviewlater') || args.hasOwnProperty('shared'));
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

	Tag.selectTags(args, function(error, tags){		
		if (!error) {
			callback(null, tags);	
		}
		else {
			callback(error, null);
		}
		
	})
}

/*

View a question that belongs to a tag.

args = {	
	question	: <question belonging to a tag>	
}

*/

TagAction.prototype.viewQuestionTagged = function( args, callback ){ 
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = args.hasOwnProperty('question');
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

	queryES.getQuestion(args.question, 0, function(result){
		if (result) {
			callback(null, result);
		}
		else {
			var error = "No result."
			callback(error, null);
		}
	});	
}

/*

View a comment that belongs to a tag.

args = {	
	commentID	: <id belonging to a comment>	
}

*/

TagAction.prototype.viewCommentTagged = function( args, callback ){ 
	//console.log(args.question)	
	queryES.getComment(args.commentID, 1, function(result){
		if (result) {
			callback(null, result);
		}
		else {
			var error = "No result."
			callback(error, null);
		}
	});	
}

/*

Get a tag that belongs to a user.

args = {	
	user		: <user id from the User model>	
}

*/

TagAction.prototype.getTaggedUser = function( args, callback ){ 	
	Tag.getUserTag(args, function(error, taggedUser){		
		if (!error) {
			callback(null, taggedUser);	
		}
		else {
			callback(error, null);
		}
		
	})	
}

/*

Update a specific tag based on a target.

args = {
		uuid			: <id for a specific Tag>			

	allowed field: 		
		user			: <user id from the User model>,	
		start			: <start time (seconds) of a video that user want to tag>
		end				: <end time (seconds) of a video that user want to tag>
		type			: <type of tag (not yet determined)>
		target			: <id that links between Tag and MediaFile>
		title			: <tag title>
		description		: <tag description>
		question		: <question belonging to a tag>
		important		: <boolean value of a video whether it is important>
		interest		: <boolean value of a video whether it is interesting>
		examable		: <boolean value of a video whether it is examable>
		reviewlater		: <boolean value of a video whether it is worth reviewing it later>
		shared			: <instructor only?>
}

*/

TagAction.prototype.updateTag = function( uuid , args, callback ){	
	if ( uuid === null || uuid === undefined ){		
		callback("UUID is not existent", null);
		return;
	}	
	if ( args === null || args === undefined ){
		console.log('not here args')
		callback("Args is not existent", null);
		return;
	}

	console.log('inside uuid =' + uuid);
	console.log('args = ' + args);

	var containsAllProperties = (args.hasOwnProperty('start') || 
		args.hasOwnProperty('end') || args.hasOwnProperty('type') || args.hasOwnProperty('target') ||
		args.hasOwnProperty('title') || args.hasOwnProperty('description') || args.hasOwnProperty('question') ||
		args.hasOwnProperty('important') || args.hasOwnProperty('interest') || args.hasOwnProperty('examable') ||
		args.hasOwnProperty('reviewlater') || args.hasOwnProperty('shared'));

	if (  !containsAllProperties ){
		callback("Need to contain at least one valid args ", null );
		return;		
	}
	
	Tag.updateTag(uuid, args, function(error, updatedTag){		
		if (!error) {
			callback(null, updatedTag);	
		}
		else {
			callback(error, null);
		}
		
	})	
}

/*

Delete a specific tag based on a uuid.

args = {
		uuid			: <id for a specific Tag will work the best>	
}

*/

TagAction.prototype.deleteTag = function( args, callback ){ 
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = args.hasOwnProperty('uuid');
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

	Tag.deleteTag( args, function(error, deletedTag){		
		if (!error) {
			callback(null, deletedTag);	
		}
		else {
			callback(error, null);
		}		
	})	
}

var object = {
		//"type":12
		//"start":2,
		//"end":54
		//"question":"pJfzndwdadddQuOicWWAjx7F00"
		//'commentID':'aJfzggggguOicWWAjx7F05'
		//"reviewlater":true
		'target':'abc1230'
		//'user':'BSDF787D98A7SDF8ASD7G'
		//'uuid':'bbc3'
  };

var newTag = {
	user:"BSDF787D98A7SDF8ASD7G2",
	start:12,
	end:34,			
	type:2,
	target:"abc1235",
	title:"mario kart",
	description:"luigi",
	question:"aJfznhseQuOicWWAjx7F00",
	important:false,
	interest:false,
	examable:true,
	reviewlater:true,
	shared:false
};

// REST
/*
{
	"user":"BSDF787D98A7SDF8ASD7G2",
	"start":12,
	"end":34,			
	"type":2,
	"target":"abc1235",
	"title":"mario kart",
	"description":"luigi",
	"question":"aJfznhseQuOicWWAjx7F00",
	"important":false,
	"interest":false,
	"examable":true,
	"reviewlater":true,
	"shared":false
}
*/

module.exports = new TagAction;