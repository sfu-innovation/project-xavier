var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');

// Accent
var Tag = require('../models/tag.js');
//var MediaFile = require('../models/mediafile.js');

// Presenter
var queryES = require('./queryES.js');
var question = require('../models/question.js');
var comment = require('../models/comment.js');
		


var TagAction = function() {	
}

/*

Adding a tag based on a user specified properties.

args = {
	user_uid		: <user id from the User model - primary key>
	start			: <start time (seconds) of a video that user want to tag>
	end				: <end time (seconds) of a video that user want to tag>
	type			: <type of tag (not yet determined)>
	target_uuid		: <id that links between Tag and MediaFile>
	title			: <tag title>
	description		: <tag description>
	question_uid	: <question belonging to a tag>
	important		: <boolean value of a video whether it is important>
	interest		: <boolean value of a video whether it is interesting>
	examable		: <boolean value of a video whether it is examable>
	reviewlater		: <boolean value of a video whether it is worth reviewing it later>
	shared			: <boolean value of a video whether it is shared by an instructor>
}

*/
TagAction.prototype.addTag = function( args, callback ){ 	
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

View all tags based on a user specified properties.

args = {
	user_uid		: <user id from the User model - primary key>
	start			: <start time (seconds) of a video that user want to tag>
	end				: <end time (seconds) of a video that user want to tag>
	type			: <type of tag (not yet determined)>
	target_uuid		: <id that links between Tag and MediaFile>
	title			: <tag title>
	description		: <tag description>
	question_uid	: <question belonging to a tag>
	important		: <boolean value of a video whether it is important>
	interest		: <boolean value of a video whether it is interesting>
	examable		: <boolean value of a video whether it is examable>
	reviewlater		: <boolean value of a video whether it is worth reviewing it later>
	shared			: <boolean value of a video whether it is shared by an instructor>
}

TO-DO: Maybe it would be beneficial to sort the tag based on the properties.
*/

TagAction.prototype.viewTags = function( args, callback ){ 
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
	question_uid	: <question belonging to a tag>	
}

*/

TagAction.prototype.viewQuestionTagged = function( args, callback ){ 
	//console.log(args.question_uid)	
	queryES.getQuestion(args.question_uid, 0, function(result){
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
	user_uid		: <user id from the User model>	
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

Update a specific tag based on a target_uuid.

args = {
	user_uid		: <user id from the User model>		

	allowed field: 		
		start			: <start time (seconds) of a video that user want to tag>
		end				: <end time (seconds) of a video that user want to tag>
		type			: <type of tag (not yet determined)>
		target_uuid		: <id that links between Tag and MediaFile>
		title			: <tag title>
		description		: <tag description>
		question_uid	: <question belonging to a tag>
		important		: <boolean value of a video whether it is important>
		interest		: <boolean value of a video whether it is interesting>
		examable		: <boolean value of a video whether it is examable>
		reviewlater		: <boolean value of a video whether it is worth reviewing it later>
		shared			: <instructor only?>
}

*/

TagAction.prototype.updateTag = function( user_uid, args, callback ){ 	
	Tag.updateTag(user_uid, args, function(error, updatedTag){		
		if (!error) {
			callback(null, updatedTag);	
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
		//"question_uid":"pJfznhheQuOicWWAjx7F010"
		//"reviewlater":true
		//'target_uuid':'abc1232'
		'user_uid':'BSDF787D98A7SDF8ASD7G'
  };

var newTag = {
	user_uid:"BSDF787D98A7SDF8ASD7G2",
	start:12,
	end:34,			
	type:2,
	target_uuid:"abc1235",
	title:"mario kart",
	description:"luigi",
	question_uid:"aJfznhseQuOicWWAjx7F00",
	important:false,
	interest:false,
	examable:true,
	reviewlater:true,
	shared:false
};


var tagAction = new TagAction();

var updatedTag = {
	'title':'samba dance', 
	'shared':true
};

/*
tagAction.addTag(newTag, function( err, data){
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

tagAction.updateTag(object, updatedTag, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - "+ data.title + ' ' + data.shared);
	} else {
		console.log( "[ERROR] - "+err);
	}
});