var es = require('com.izaakschroeder.elasticsearch')
	,db = es.connect('localhost'),
	indice = ['presenter', 'accent'], //, 'engage', 'rqra'];
	mappings = ['questions', 'comments'],
	index = db.index('presenter'),
	mapping = index.mapping('questions'),
	UUID = require('com.izaakschroeder.uuid');

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
		console.log("empty");
		return;
	}

	var data = {
		query: {
			bool:{
				must:[{
					query_string: {
						default_field: '_all',
						query: search
					}
				}]
			}
		},
		from: 0,
		size: 20
	};

	switchIndex(appType);
	switchMapping(0);

	index.search(data, function(err, data){
		if(data && data.hits.total !== 0) {
			callback(data.hits);
		} else { 
			callback(undefined);
		}
	});
}

//Add a new question
QueryES.prototype.addQuestion = function(data, appType, callback){
	var document;

	switchIndex(appType);
	switchMapping(0);

	document = mapping.document(data.id);

	document.set(data, function(err, req, data){
		if(data){
			callback(data);
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

//update question title and body
QueryES.prototype.updateQuestion = function(questionID, questionTitle, questionBody, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';

	var data = {
		'script':'ctx._source.title = title; ctx._source.body = body',
		'params':{
			'title':questionTitle,
			'body':questionBody
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
			bool:{
				must:[{
					term:{
						target_uuid: ptarget_uuid
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
			callback(data.hits);
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
			callback(data.hits);
		}
		else{
			callback(data); // not yet
			//console.log("User did not post any comments");
		}
	});
}

//create a new comment
QueryES.prototype.addComment = function(data, appType, callback){
	var document;

	switchIndex(appType);
	switchMapping(1);

	document = mapping.document(data.id);

	document.set(data, function(){
		callback();
	});
}

//update comment body based on commentID
QueryES.prototype.updateComment = function(commentID, comment, appType, callback){	

	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';

	var data = {
		'script':'ctx._source.body = body',
		'params':{
			'body':comment
		}
	}

	db.post(link, data, function(){
		callback();
	})
}

//delete a comment
QueryES.prototype.deleteComment = function(commentID, appType, callback){
	var document;

	switchIndex(appType);
	switchMapping(1);

	document = mapping.document(commentID);
	document.delete(function(){
		callback();
	});
}

//update a comment vote
QueryES.prototype.updateVote = function(commentID, direction, appType, callback){
	var data;

	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';

	if (direction === 0) {
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
	db.post(link, data, function(){
		// increment
		callback();
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
	db.post(link, data, function(){		
		callback();
	})
}

module.exports = new QueryES;
