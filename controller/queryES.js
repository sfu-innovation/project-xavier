var es = require('com.izaakschroeder.elasticsearch'),
	db = es.connect('localhost'),
	indice = ['presenter', 'accent'], //, 'engage', 'rqra'];
	mappings = ['questions', 'comments'],
	index = db.index('presenter'),
	mapping = index.mapping('questions'),
	UUID = require('com.izaakschroeder.uuid'),
	notification = require('./NotificationAction.js');

var QueryES = function() {	
}

// change the index to whatever you want
var switchIndex = function(appType) {
	var indexType = indice[appType];
	index = db.index(indexType);
	return indexType;
}

// change the mapping to whatever you want
var switchMapping = function(appType) {
	var mappingType = mappings[appType];
	mapping = index.mapping(mappingType);
	return mappingType;
}

//get a question
QueryES.prototype.getQuestion = function(questionID, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID;
	
	db.get(link, {}, function(err, req, data){
		if (data) {
			callback(data._source);
		}else{
			callback(undefined);
		}
	});
}

//get all question
QueryES.prototype.getAllQuestions = function(appType, callback){
	var data = {
		query: {
			match_all:{}
		}
	};

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(data.hits.total !== 0){
			callback(data.hits.hits); //only need the hits.hits part
		}
		else{
			callback(undefined);
		}
	});
}

QueryES.prototype.getAllQuestionByUserID = function(userID, appType, callback){
	var data = {
		query: {
			bool:{
				must:[{
					term:{
						user: userID
					}
				}]
			}
		},
		from: 0,
		size: 20
	};

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(data.hits.total !== 0){
			callback(data.hits.hits);
		}
		else{
			callback(undefined);
		}
	});
}

//search based on query
QueryES.prototype.searchAll = function(search, appType, callback){

	if(!search){
		callback(undefined);
		return;
	}

	var data = {
		query: {
			flt:{
				"fields":["title", "body"]
				, "like_text":search
			}
		},
		sort:[{"title.untouched":{"order":"asc"}}],
		from: 0,
		size: 20
	};

	switchIndex(appType);
	switchMapping(0);

	index.search(data, function(err, data){
		if(data && data.hits.total !== 0) {
			callback(data.hits.hits);
		} else { 
			callback(undefined);
		}
	});
}

//Add a new question
QueryES.prototype.addQuestion = function(data, appType, callback){
	var document;
	var questionUuid = UUID.generate();

	switchIndex(appType);
	switchMapping(0);

	document = mapping.document(questionUuid);
	data.timestamp = new Date().toISOString();

	notification.createNewQuestion({user:data.user, target:questionUuid, app:appType}, function(err, result){

		if(result){

			document.set(data, function(err, req, data){
				if(data){
					callback(data);
				}else{
					callback(undefined);
				}
			})
		}else{
			callback(undefined);
		}

	});
}

//Add a new follower
QueryES.prototype.addFollower = function(questionID, followerID, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';

	var data = {
		'script':'ctx._source.followup.contains(followup) ? ctx.op = \"none\"; : ctx._source.followup += followup;',
		'params':{
			'followup':followerID
		}
	}

	db.post(link, data, function(err, req, data){
		if(data){
			callback(data);
		}else{
			callback(undefined);
		}
	})
}

//Remove a new follower
QueryES.prototype.removeFollower = function(questionID, followerID, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';

	var data = {
		'script':'ctx._source.followup.contains(followup) ? ctx._source.followup.remove(followup) : ctx.op = \"none\";',
		'params':{
			'followup':followerID
		}
	}

	db.post(link, data, function(err, req, data){

		if(data){
			callback(data);
		}else{
			callback(undefined);
		}
	})
}

//Get questionID by follower
QueryES.prototype.getQuestionByFollowerID = function(followerID, appType, callback){
	var data= {
		"query": {
			"term": {"followup": "newGuy"}
		}
	}

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(data && data.hits.total !== 0) {
			callback(data.hits.hits);
		} else {
			callback(undefined);
		}
	});
}

//update question title and body
QueryES.prototype.updateQuestion = function(questionID, questionTitle, questionBody, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';

	var date = new Date().toISOString();

	var data = {
		'script':'ctx._source.title = title; ctx._source.body = body; ctx._source.timestamp = date;',
		'params':{
			'title':questionTitle,
			'body':questionBody,
			'date':date
		}
	}

	db.post(link, data, function(err, req, data){
		if(data){
			callback(data);
		}else{
			callback(undefined);
		}
	})
}

//delete a uid
QueryES.prototype.deleteQuestion = function(questionID, appType, callback){
	var document;

	switchIndex(appType);
	switchMapping(0);

	document = mapping.document(questionID);
	document.delete(function(err, req, data){
		if(data){
			callback(data);
		}else{
			callback(undefined);
		}
	});
}


//change the status of a question from unanswered to answered
QueryES.prototype.updateStatus = function(questionID, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';

	var data = {
		'script':'ctx._source.status = status',
		'params':{
			'status':'answered'
		}
	}

	//add new comment to the document found at uid
	db.post(link, data, function(err, req, data){
		if(data){
			callback(data);
		}else{
			callback(undefined);
		}
	})
}


//////////////////////////////////////////////////////////////////////////////////////////////////
// Comments
//////////////////////////////////////////////////////////////////////////////////////////////////

//get a comment data based on commentID
QueryES.prototype.getComment = function(commentID, appType, callback){
	var link = '/' + switchIndex(appType) + '/comments/' + commentID;
	
	db.get(link, {}, function(err, req, data){
		if (data) {
			callback(data._source);
		}else{
			callback(undefined);
		}
	});
}

//get a comment data based on target_uuid
// note: means, get all comments associated with a question
QueryES.prototype.getCommentByTarget_uuid = function(ptarget_uuid, appType, callback){
	
	var data = {
		  query: {
		    query_string: {
		      "fields": [
		        "target_uuid"
		      ],
		      "query": ptarget_uuid
		    },
		    "from": 0,
		    "size": 20
		  }
	};

	switchIndex(appType);
	switchMapping(1);

	mapping.search(data, function(err, data){
		if(data.hits.total !== 0){
			callback(data.hits.hits);
		}
		else{
			//console.log("Specified target_uuid does not contain any comments");
			callback(undefined);
		}
	});
}

//get all comments
QueryES.prototype.getAllComments = function(appType, callback){
	var data = {
		query: {
			match_all:{}
		}
	};

	switchIndex(appType);
	switchMapping(1);

	mapping.search(data, function(err, data){
		if(data.hits.total !== 0){
			callback(data.hits.hits);
		}
		else{
			callback(undefined);
		}
	});
}

//get all comment data based on userID for now
QueryES.prototype.getAllCommentByUserID = function(userID, appType, callback){
	var data = {
		query: {
			bool:{
				must:[{
					term:{
						user: userID
					}
				}]
			}
		},
		from: 0,
		size: 20
	};

	switchIndex(appType);
	switchMapping(1);

	mapping.search(data, function(err, data){
		if(data.hits.total !== 0){
			callback(data.hits.hits);
		}
		else{
			callback(undefined);
			console.log("User did not post any comments");
		}
	});
}

//create a new comment
QueryES.prototype.addComment = function(data, appType, callback){
	var document;
	var commentUuid = UUID.generate();

	switchIndex(appType);
	switchMapping(1);

	document = mapping.document(commentUuid);
	data.timestamp = new Date().toISOString();

	notification.addCommentNotifier({user:data.user, target:data.target_uuid, app:appType}, function(err, result){
		document.set(data, function(err, req, data){
			if (data) {
				callback(data);
			}
			else {
				callback(undefined);
			}

		});
	});
}

//update comment body based on commentID
QueryES.prototype.updateComment = function(commentID, commentTitle, commentBody, appType, callback){	

	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';

	var date = new Date().toISOString();

	var data = {
		'script':'ctx._source.title = title; ctx._source.body = body; ctx._source.timestamp = date',
		'params':{
			'title':commentTitle,
			'body':commentBody,
			'date':date
		}
	}

	db.post(link, data, function(err, req, data){
		if (data) {
			callback(data);
		}
		else {
			callback(undefined);
		}
	})
}

//delete a comment
QueryES.prototype.deleteComment = function(commentID, appType, callback){
	var document;

	switchIndex(appType);
	switchMapping(1);

	document = mapping.document(commentID);
	document.delete(function(err, req, data){
		if (data) {
			callback(data);
		}
		else {
			callback(undefined);
		}
	});
}

//update a comment vote
QueryES.prototype.updateVote = function(commentID, direction, appType, callback){
	var data;

	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';

	if (direction === '0') {
		data = {
			'script':'ctx._source.upvote += upvote',
			'params':{
				'upvote':1
			}
		}
	}
	else {
		data = {
			'script':'ctx._source.downvote += downvote',
			'params':{
				'downvote':1
			}
		}
	}

	//increment the vote found at commentID
	db.post(link, data, function(err, req, data){
		if (data) {
			callback(data);
		}
		else {
			callback(undefined);
		}
	})
}

//update a comment isAnswered
QueryES.prototype.updateIsAnswered = function(commentID, appType, callback){
	var data;

	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';

	data = {
		'script':'ctx._source.isAnswered = status',
		'params':{
			'status':'true'
		}
	}

	//set isAnswered to true for the comment found at commentID
	db.post(link, data, function(err, req, data){
		if (data) {
			callback(data);
		}
		else {
			callback(undefined);
		}
	})
}

module.exports = new QueryES;
