var es = require('com.izaakschroeder.elasticsearch'),
	db = es.connect('localhost'),
	indice = ['presenter', 'accent', 'engage'],
	mappings = ['questions', 'comments'],
	index = db.index('presenter'),
	mapping = index.mapping('questions'),
	UUID = require('com.izaakschroeder.uuid'),
	notification = require('./NotificationAction.js'),
	organizationAction = require('./OrganizationAction.js'),
	async = require('async'),
	user = require('../models/user.js'),
	sizeOfResult = 5;

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

//page converter
var paging = function(pageNum){
	var pageBeg = pageNum * sizeOfResult;
	return pageBeg;
}

var getUserObj = function(data, callback){
	var result = {};
	result.hits = [];
	result.total = data.hits.total;

	async.forEach(data.hits.hits, function(obj, done){

		user.selectUser({"uuid":obj._source.user}, function(error, user){
			if(user){
				obj.user = user;
			}
			else{
				obj.user = "User not found: " + obj._source.user;
			}

			result.hits.push(obj);
			done();
		});
	}, function(err){

		callback(result);
	});
}
//
QueryES.prototype.getAllQuestionsByUuids = function(questionUuids, appType, callback){
	var self = this;
	var questions = [];

	async.forEach(questionUuids, function(questionUuid, callback){
		self.getQuestion(questionUuid, appType, function(data){
			if(data){
				questions.push(data);
			}
			callback();
		})
	}, function(err){
		if(err){
			throw err;
		}
		callback(questions);
	})
}

QueryES.prototype.questionViewCount = function(questionID, appType, callback){
	var data;
	var link = '/' + switchIndex(appType) + '/questions/' + questionID +'/_update';

	data = {
		'script':'ctx._source.viewCount += viewCount',
		'params':{
			'viewCount':1
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

QueryES.prototype.getInstructorQuestion = function(appType, pageNum, callback){
	var data = {
			"query": {
				"term": {
					"isInstructor": "true"
				}
			},
			"sort": [
				{
					"timestamp": {
						"order": "desc"
					}
				}
			],
		from: paging(pageNum),
		size: sizeOfResult
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
QueryES.prototype.getAllQuestions = function(appType, pageNum, callback){
	var data = {
		query: {
			match_all:{}
		},
		from: paging(pageNum),
		size: sizeOfResult
	};

	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(data.hits.total !== 0){
			getUserObj(data, callback);
		}
		else{
			callback(undefined);
		}
	});
}

QueryES.prototype.getAllQuestionByUserID = function(userID, pageNum, appType, callback){
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
		from: paging(pageNum),
		size: sizeOfResult
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

QueryES.prototype.getAllUnansweredQuestions = function(appType, pageNum, callback){
	var data = {
		query: {
			term:{
				status:"unanswered"
			}
		},
		from: paging(pageNum),
		size: sizeOfResult
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

QueryES.prototype.getAllNewQuestions = function(appType, pageNum, callback){
	var data = {
		"query": {
			"match_all": {}
		},
		"sort": [
			{
				"created": {
					"order": "desc"
				}
			}
		],
		from: paging(pageNum),
		size: sizeOfResult
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

QueryES.prototype.getAllRecentlyAnsweredQuestions = function(appType, pageNum, callback){
	var data = {
		"query": {
			"term": {
				"status": "answered"
			}
		},
		"sort": [
			{
				"timestamp": {
					"order": "desc"
				}
			}
		],
		from: paging(pageNum),
		size: sizeOfResult
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

//search based on query
QueryES.prototype.searchAll = function(search, pageNum, appType, callback){

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
		from: paging(pageNum),
		size: sizeOfResult
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
	var args = {};	//used for organizationAction

	switchIndex(appType);
	switchMapping(0);

	document = mapping.document(questionUuid);
	data.timestamp = new Date().toISOString();
	data.created = data.timestamp;

	//should check if adding to a section is really needed. rqra dont need it
	args.section = data.sectionUuid;	//section uuid
	args.resource = questionUuid;	//question uuid

	delete data.sectionUuid;

	user.selectUser({"uuid":data.user}, function(error, user){
		if(user){
			if(user.type === 1){
				data.isInstructor = 'true';
			}else{
				data.isInstructor = 'false';
			}

			document.set(data, function(err, req, esResult){
				if(esResult){
					console.log('Added question to ES');
					organizationAction.addResourceToSection(args, function(err, orgResult){
						console.log('Added question resource to section');
						notification.createNewQuestion({app:appType, user:data.user, target:questionUuid}, function(err, result){
							if(result){
								console.log('Added question notification');
								callback(null, esResult);
							}else{
								callback(undefined);
							}
						});
					});
				}else{
					callback(undefined);
				}
			})
		}else{
			callback(undefined);
		}
	})
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


//change the status of a question from unanswered to answered, increments comment count
QueryES.prototype.updateStatus = function(questionID, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID + '/_update';
	var date = new Date().toISOString();

	var data = {
		'script':'ctx._source.status = status; ctx._source.timestamp = date;ctx._source.commentCount += count ',
		'params':{
			'status':'answered',
			'date':date,
			'count':1
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
QueryES.prototype.getCommentByTarget_uuid = function(ptarget_uuid, pageNum, appType, callback){
	
	var data = {
		  query: {
			  term: {
				  target_uuid: ptarget_uuid
			  }
		  },
		from: paging(pageNum),
		size: sizeOfResult
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
QueryES.prototype.getAllComments = function(appType, pageNum, callback){
	var data = {
		query: {
			match_all:{}
		},
		from: paging(pageNum),
		size: sizeOfResult
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

QueryES.prototype.getCommentCount = function(questionUuid, appType, callback){
	var data = {
		query: {
			term: {
				target_uuid: questionUuid
			}
		}
	};

	switchIndex(appType);
	switchMapping(1);

	mapping.search(data, function(err, data){
		if(data.hits){
			callback(data.hits.total);
		}
		else{
			callback(undefined);
		}
	});
}

//get all comment data based on userID for now
QueryES.prototype.getAllCommentByUserID = function(userID, pageNum, appType, callback){
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
		from: paging(pageNum),
		size: sizeOfResult
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
	var self = this;

	switchIndex(appType);
	switchMapping(1);

	document = mapping.document(commentUuid);
	data.timestamp = new Date().toISOString();
	data.created = data.timestamp;

	self.updateStatus(data.target_uuid, appType, function(updateResult){
		if(updateResult){
			document.set(data, function(err, req, esData){
				if (esData) {
/*Alex's stuff
					var args = {
						target:data.target_uuid
						,app:appType
						,user:data.user
						,description:'Yo dawg, i heard you like comments'	//TODO:need meaningful description
					};
					notification.addCommentUserNotification(args, function(err, usrNotificationResult){
						if(usrNotificationResult){
							console.log("successfully added usr comment notification");

							delete args.description;
							notification.addCommentNotifier(args, function(err, result){
								if(result){
									console.log("successfully added comment notification");
									callback(esData);
								}else{
									callback(undefined);
								}
							});
						}else{
							callback(undefined);
						}
					});
 */
					callback(esData);
				}else {
					callback(undefined);
				}
			});
		}else{
			callback(undefined);
		}
	});


}

//update comment body based on commentID
QueryES.prototype.updateComment = function(commentID, commentBody, appType, callback){

	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';
	var date = new Date().toISOString();

	var data = {
		'script':'ctx._source.body = body; ctx._source.timestamp = date',
		'params':{
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

	if (parseInt(direction) === 0) {
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


/***NEW METHODS OMG***/
//searchObj types: 	{ lastest, replied, instructor, viewed, unanswered, myQuestions }
QueryES.prototype.searchQuestions = function(appType, pageNum, searchObj, callback){
	var self = this;
	/// course, week, , searchQuery, searchType
	if(!searchObj.searchQuery && searchObj.searchType !== 'myQuestions' &&
		searchObj.searchType !== 'viewed' && searchObj.searchType !== 'replied'){
		console.log('searchQuery is undefined');
		callback(undefined);
		return;
	}

	var data = {
		query: {
			bool:{
				must:[
					{
				flt:{
				"fields":["title", "body"]
				, "like_text":searchObj.searchQuery
				}}
				]
			}
		},
		//sort:[{"title.untouched":{"order":"asc"}}],
		from: paging(pageNum),
		size: sizeOfResult
	};

	switch(searchObj.searchType){
		case 'latest':{
			data = latestQuestion(data);
			break;
		}
		case 'instructor':{
			data = instructorQuestion(data);
			break;
		}
		case 'unanswered':{
			data = unansweredQuestion(data);
			break;
		}
		case 'myQuestions':{
			//TODO: change to use session user
			data = myQuestion(data, searchObj);
			break;
		}
		case 'viewed':{
			data = viewed(data, searchObj);
			break;
		}
		case 'replied':{
			data = replied(data, searchObj);
			break;
		}
	}


	switchIndex(appType);
	switchMapping(0);

	mapping.search(data, function(err, data){
		if(data) {
			callback(data.hits);
		} else {
			callback(undefined);
		}
	});
}

//get questions sorted by comment count
var replied = function(data, searchObj){
	if(searchObj.searchQuery === ''){
		console.log("search query is empty");
		data.query.bool.must = [{match_all:{}}];
	}
	data.sort = [{"commentCount":{"order":"desc"}},{"title.untouched":{"order":"asc"}}];

	return data;
}

//get the latest question sorted by create date
var latestQuestion = function(data){
	data.sort = [{"created":{"order":"desc"}},{"title.untouched":{"order":"asc"}}];
	return data;
}

//get all instructor posted question
var instructorQuestion = function(data){
	data.query.bool.must.push({"term":{"isInstructor": "true"}});
	//sort
	return data;
}

//get all unanswered question
var unansweredQuestion = function(data){
	data.query.bool.must.push({"term":{"status": "unanswered"}});
	//sort
	return data;
}

//get question sorted by user uuid
var myQuestion = function(data, searchObj){
	if(searchObj.searchQuery === ''){
		console.log("search query is empty");
		data.query.bool.must = [{match_all:{}}];
	}

	data.query.bool.must.push({"term":{"user": searchObj.user}});

	return data;
}

//get questions sorted by view count
var viewed = function(data, searchObj){
	if(searchObj.searchQuery === ''){
		console.log("search query is empty");
		data.query.bool.must = [{match_all:{}}];
	}

	data.sort = [{"viewCount":{"order":"desc"}},{"title.untouched":{"order":"asc"}}];
	return data;
}

module.exports = new QueryES;