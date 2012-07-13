var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');

// Accent
var Tag = require('../models/tag.js');
//var MediaFile = require('../models/mediafile.js');

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
	user			: <user id from the User model - primary key>,
	uuid 			: <id belonging to a tag>,
	start			: <start time (seconds) of a video that user want to tag>
	end				: <end time (seconds) of a video that user want to tag>
	type			: <type of tag (not yet determined)>
	target		: <id that links between Tag and MediaFile>
	title			: <tag title>
	description		: <tag description>
	question	: <question belonging to a tag>
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
	question	: <question belonging to a tag>	
}

*/

TagAction.prototype.viewQuestionTagged = function( args, callback ){ 
	console.log(args.question)	
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
	Tag.updateTag(uuid, args, function(error, updatedTag){		
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
		//"question":"pJfzndwdadddQuOicWWAjx7F00"
		//'commentID':'aJfzggggguOicWWAjx7F05'
		//"reviewlater":true
		//'target':'abc1232'
		'user':'BSDF787D98A7SDF8ASD7G'
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


var tagAction = new TagAction();

var updatedTag = {
	'title':'samba dance', 
	'shared':true
};
/*
tagAction.viewTags(object, function( err, data){
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

/*
tagAction.updateTag(object, updatedTag, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - "+ data.title + ' ' + data.shared);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/


tagAction.getTaggedUser(object, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - "+ data.lastName + ' ' + data.firstName);
	} else {
		console.log( "[ERROR] - "+err);
	}
});


/*
tagAction.viewQuestionTagged(object, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - "+ JSON.stringify(data));
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/

/*
tagAction.viewCommentTagged(object, function( err, data){
	if (data) {
		console.log( "[SUCCESS] - "+ JSON.stringify(data));
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/

module.exports = new TagAction;