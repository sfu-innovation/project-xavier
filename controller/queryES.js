var es = require('com.izaakschroeder.elasticsearch'),
	db = es.connect('localhost'),
	indice = ['presenter', 'accent', 'engage'],
	mappings = ['questions', 'comments'],
	index = db.index('presenter'),
	mapping = index.mapping('questions'),
	UUID = require('com.izaakschroeder.uuid'),
	notification = require('./NotificationAction.js'),
	async = require('async'),
	user = require('../models/user.js'),
	userProfile = require('../models/userProfile.js'),
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

//add many user objects to result
var addUsersToData = function(data, callback){
	var result = {};
	result.total = data.hits.total;
	result.hits = [];

	async.forEach(data.hits.hits, function(obj, done){
		require('../models/user.js').selectUser({"uuid":obj._source.user}, function(error, user){

			if(error){throw error;}

			if(user){
				obj.user = user;
			}
			else{
				obj.user = "User not found: " + obj._source.user;
			}

			userProfile.getUserProfile(obj._source.user, function(err, profile){
				if(err)
					done(err);

				if(profile){
					obj.profile = profile.profilePicture;
				}
				result.hits.push(obj);
				done();
			})
		});
	}, function(err){
		//console.log(JSON.stringify(result))
		callback(err, result);
	});
}

//add a single user object to result
var addUserToData = function(data, callback){
	require('../models/user.js').selectUser({"uuid":data._source.user}, function(error, user){

		if(user){
			data.user = user;
		}
		else{
			data.user = "User not found: " + data._source.user;
		}

		if(error){
			callback(error);
		}else{
			callback(null, data);
		}
	});
}
//
QueryES.prototype.getAllQuestionsByUuids = function(questionUuids, appType, callback){
	var self = this;
	var questions = [];

	async.forEach(questionUuids, function(questionUuid, callback){
		self.getQuestion(questionUuid, appType, function(err, data){
			if(data){
				questions.push(data);
			}
			callback();
		})
	}, function(err){
		if(err)
			return callback(err);

		callback(null, questions);
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
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//TODO:deprecated
QueryES.prototype.getInstructorQuestion = function(appType, pageNum, callback){
	var data = {
			"query": {
				"term": {
					"isInstructor": true
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
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//get a question
QueryES.prototype.getQuestion = function(questionID, appType, callback){
	var link = '/' + switchIndex(appType) + '/questions/' + questionID;
	
	db.get(link, {}, function(err, req, data){
		if(err)
			return callback(err);

		addUserToData(data, callback);
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
		if (err)
			return callback(err);

		addUsersToData(data, callback);
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
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//TODO:deprecated
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
		if(err)
			callback(err);

		addUsersToData(data, callback);
	});
}

//TODO:deprecated
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
		if(err)
			return callback(err);

		addUsersToData(data, callback);
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
		if(err)
			return callback(err);

		addUsersToData(data, callback);
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
		if(err)
			return callback(err);

		addUsersToData(data, callback);
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
	args.section = data.week;	//section uuid
	args.resource = questionUuid;	//question uuid

	user.selectUser({"uuid":data.user}, function(error, user){
		if(error)
			return callback(error);

		if(user.type === 1){
			data.isInstructor = 'true';
		}else{
			data.isInstructor = 'false';
		}

		//TODO:ADD COURSE & WEEK FOR PRESENTER

		document.set(data, function(err, req, esResult){
			if(err)
				return callback(error);

			console.log('Added question to ES');
			require('./OrganizationAction.js').addResourceToSection(args, function(err, orgResult){
				if(err)
					return callback(err);

				console.log('Added question resource to section');
				notification.createNewQuestion({app:appType, user:data.user, target:questionUuid}, function(err, result){
					if(err)
						return callback(err);

					console.log('Added question notification');
					callback(null, esResult);
				});
			});
		})
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
		if(err)
			return callback(err);

		callback(null, data);
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
		if(err)
			return callback(err);

		callback(null, data);
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
		if(err)
			return callback(err);

		addUsersToData(data, callback);
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
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//delete a uid
QueryES.prototype.deleteQuestion = function(questionID, appType, callback){
	var document;

	switchIndex(appType);
	switchMapping(0);

	document = mapping.document(questionID);
	document.delete(function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
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
		if(err)
			return callback(err);

		callback(null, data);
	})
}


//////////////////////////////////////////////////////////////////////////////////////////////////
// Comments
//////////////////////////////////////////////////////////////////////////////////////////////////

//get a comment data based on commentID
QueryES.prototype.getComment = function(commentID, appType, callback){
	var link = '/' + switchIndex(appType) + '/comments/' + commentID;

	db.get(link, {}, function(err, req, data){
		if(err)
			return callback(err);

		addUserToData(data, callback);
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
		size: sizeOfResult,
		"sort": [
			{"upvote": {"order": "desc"}},
			{"downvote": {"order": "desc"}}
		]
	};

	switchIndex(appType);
	switchMapping(1);

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
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
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

QueryES.prototype.getCommentCount = function(appType, questionUuid, callback){
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
		if(err)
			return callback(err);

		callback(null, parseInt(data.hits.total));
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
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//create a new comment
QueryES.prototype.addComment = function(data, appType, callback){
	var document;
	var commentUuid = UUID.generate();
	var self = this;
	var args = {
		target:data.target_uuid
		,app:appType
		,user:data.user
		,description:data.body
	};

	switchIndex(appType);
	switchMapping(1);

	document = mapping.document(commentUuid);
	data.timestamp = new Date().toISOString();
	data.created = data.timestamp;

	self.updateStatus(args.target, appType, function(err, updateResult){
		if(err)
			return callback(err);

		document.set(data, function(err, req, esData){
			if(err)
				return callback(err);
				console.log("document added");

				notification.addCommentUserNotification(args, function(err, usrNotificationResult){
					if(err){
						console.log(err);
						return callback(err);
					}

					delete args.description;
					notification.addCommentNotifier(args, function(err, result){
						if(err){
							console.log(err);
							callback(err);
						}

						console.log('complete');

						callback(null, esData);
					});
				});


			//callback(null, esData);
		});

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
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//delete a comment
QueryES.prototype.deleteComment = function(commentID, appType, callback){
	var document;
	var args;
	switchIndex(appType);
	switchMapping(1);

	document = mapping.document(commentID);
	this.getComment(commentID, 0, function(err, result){
		if(err)
			return callback(err);

		document.delete(function(err, req, data){
			if(err)
				return callback(err);

			args = {user:result._source.user, target: result._source.target_uuid, app: appType};

			notification.removeCommentNotifier( args, function(err, result){
				if(err)
					return callback(err)

				callback(null, data);
			});
		});
	});
}

//update a comment vote
QueryES.prototype.updateVote = function(commentID, direction, appType, callback){
	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';
	var data = {};

	if (parseInt(direction) === 0) {
		data = {
			'script':'ctx._source.upvote += upvote',
			'params':{
				'upvote':1
			}
		}
	}else {
		data = {
			'script':'ctx._source.downvote += downvote',
			'params':{
				'downvote':1
			}
		}
	}

	//increment the vote found at commentID
	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//TODO:deprecated
//update a comment isAnswered
QueryES.prototype.updateIsAnswered = function(commentID, appType, callback){
	var link = '/' + switchIndex(appType) + '/comments/' + commentID +'/_update';
	var data = {
		'script':'ctx._source.isAnswered = status',
		'params':{
			'status':'true'
		}
	}

	//set isAnswered to true for the comment found at commentID
	db.post(link, data, function(err, req, data){
		if(err)
			return callback(err);

		callback(null, data);
	})
}

//JSON searchObj:	{searchType, user, course, week}
//searchObj types: 	{ lastest, replied, instructor, viewed, unanswered, myQuestions }
//EXAMPLE:
/*
 {
 "searchQuery" : "",
 "searchType":"viewed",
 "course":"cmpt300",
 "week": "1",
 "user":""
 }
 */
QueryES.prototype.searchQuestionsRoute = function(appType, pageNum, searchObj, callback){
	/// course, week, , searchQuery, searchType
	var data = {
		query: {
			bool:{
				must:[]
			}
		},
		from: paging(pageNum),
		size: sizeOfResult
	};

	if(searchObj.searchQuery){
		data.query.bool.must.push(
			{
			flt:{
				"fields":["title", "body"]
				, "like_text":searchObj.searchQuery
			}});
	}else{
		data.query.bool.must.push({match_all:{}});
	}

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

	//check to see which type its in
	if(searchObj.course){
		console.log("ES search- course param provided")
		data.query.bool.must.push({"term":{"course": searchObj.course}});
		if(searchObj.week){
			console.log("ES search - week param provided")
			data.query.bool.must.push({"term":{"week": parseInt(searchObj.week)}});
		}
	}


	switchIndex(appType);
	switchMapping(0);
	console.log(JSON.stringify(data))

	mapping.search(data, function(err, data){
		if(err)
			return callback(err);

		addUsersToData(data, callback);
	});
}

//get questions sorted by comment count
var replied = function(data, searchObj){
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
	data.query.bool.must.push({"term":{"isInstructor": true}});
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
	data.query.bool.must.push({"term":{"user": searchObj.uuid}});
	return data;
}

//get questions sorted by view count
var viewed = function(data, searchObj){
	data.sort = [{"viewCount":{"order":"desc"}},{"title.untouched":{"order":"asc"}}];
	return data;
}

module.exports = new QueryES;