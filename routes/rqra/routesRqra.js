var queryES = require('./../../controller/queryES.js');
var nlp = require('./../../controller/nlp.js');
var question = require('./../../models/question.js');
var comment = require('./../../models/comment.js');

exports.demo = function(request, response) {
	response.render('rqra/demo', { title: "Demo" });
}

exports.questionRoute = function(appType, request, response) {
	var question_id = request.params.uid;
	if (request.method === "GET") {
		queryES.getQuestion(question_id, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, question: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});

	}

	//post a new question
	else if (request.method === "POST"){
		//if not log in, cannot create a question
		if(request.session && request.session.user){
			console.log(request.session.user);
			//user, title, body, category
			var newQuestion = new question(request.session.user.uuid
			,request.body.question.title
			,request.body.question.body
			,request.body.question.category);


			queryES.addQuestion(newQuestion, appType, function(error, result) {
				if (result) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, question: result}));
				} else {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}

	else if (request.method === "PUT") {
		//TODO: need update document and unit-test
		var questionTitle = request.body.title;
		var questionBody = request.body.body;

		queryES.updateQuestion(question_id,questionTitle,questionBody, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, question: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});

	} else if (request.method === "DELETE") {
		queryES.deleteQuestion(question_id, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, question: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}
}

exports.question = function(request, response) {
	exports.questionRoute(0, request, response);
}

exports.questionsRoute = function(appType, request, response){
	if (request.method === "GET") {
		queryES.getAllQuestions( appType, request.params.page, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, questions: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}

}

//get all questions
exports.questions = function(request, response) {
	   exports.questionsRoute(0,request,response);
}

exports.questionsUnansweredRoute = function(appType, request, response){
	if (request.method === "GET") {
		queryES.getAllUnansweredQuestions( appType, request.params.page, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, questions: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}
}

exports.questionsUnanswered = function(request, response){
	exports.questionsUnansweredRoute(0, request, response);
}

exports.questionsNewRoute = function(appType, request, response){
	if (request.method === "GET") {
		queryES.getAllNewQuestions( appType, request.params.page, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, questions: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}
}

exports.questionsNew = function(request, response){
	exports.questionsNewRoute(0, request, response);
}

exports.questionsAnsweredRoute = function(appType, request, response){
	if (request.method === "GET") {
		queryES.getAllRecentlyAnsweredQuestions( appType, request.params.page,function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, questions: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}
}

exports.questionsAnswered = function(request, response){
	exports.questionsAnsweredRoute(0, request, response);
}

exports.questionsByUserRoute = function(appType, request, response) {
	var userId = request.params.uid;

	if (request.method === "GET") {
		queryES.getAllQuestionByUserID(userId, request.params.page, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, questions: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}
		//deprecated, used POST for question in questionRoute

//	} else if (request.method === "POST") {
//		queryES.addQuestion(request.body.question, appType, function(result) {
//			if (result) {
//				response.writeHead(200, { 'Content-Type': 'application/json' });
//				response.end(JSON.stringify({ errorcode: 0, question: result}));
//			} else {
//				response.writeHead(200, { 'Content-Type': 'application/json' });
//				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
//			}
//		});
//	}
}

exports.questionsByUser = function(request, response) {
	exports.questionsByUserRoute(0, request, response);
}

exports.followQuestionRoute = function(appType, request, response) {
	var questionId = request.params.uid;

	if (request.method === "PUT") {

		if(request.session && request.session.user){
			queryES.addFollower(questionId, request.session.user.uuid, appType, function(result) {
				if (result) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, question: result}));
				} else {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: "Duplicated Follower" }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}
}


exports.unfollowQuestionRoute = function(appType, request, response) {
	var questionId = request.params.uid;

	if (request.method === "PUT") {

		if(request.session && request.session.user){
			queryES.removeFollower(questionId, request.session.user.uuid, appType, function(result) {
				if (result) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, question: result}));
				} else {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: "Duplicated Follower" }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}
	}
}

exports.followQuestion = function(request, response) {
	exports.followQuestionRoute(0, request, response);
}

exports.unfollowQuestion = function(request, response) {
	exports.unfollowQuestionRoute(0, request, response);
}

exports.questionStatusRoute = function(appType, request, response) {
	var questionId = request.params.uid;

	if (request.method === "PUT") {
		queryES.updateStatus(questionId, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, question: result}));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}
}

exports.questionStatus = function(request, response) {
	exports.questionStatusRoute(0, request, response);
}

exports.commentRoute = function(appType, request, response) {
	var comment_id = request.params.uid;

	if (request.method === "GET") {
		queryES.getComment(comment_id, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, comment: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	} else if (request.method === "POST"){
		if(request.session && request.session.user){
			//target_uuid, user, objectType, title, body
			var newComment = new comment(request.body.comment.target_uuid
			,request.session.user.uuid
			,request.body.comment.objectType
			,request.body.comment.title
			,request.body.comment.body);

			queryES.addComment(newComment, appType, function(result) {
				if (result) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, comment: result}));
				} else {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}


	} else if (request.method === "PUT") {
		var commentTitle = request.body.title;
		var commentBody = request.body.body;
		queryES.updateComment(comment_id, commentTitle, commentBody, appType, function(result) {
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, comment: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Couldn't update comment" }));
			}

		});

	} else if (request.method === "DELETE") {
		queryES.deleteComment(comment_id, appType, function(result) {
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, result: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, error: "Couldn't delete comment" }));
			}
		});
	}
}

exports.comment = function(request, response) {
	exports.commentRoute(0, request, response);
}


exports.commentsRoute = function(appType,request,response){
	if (request.method === "GET") {
		queryES.getAllComments(appType, request.params.page,function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, comments: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}

}

//get all comments
exports.comments = function(request, response) {
	  exports.commentsRoute(0,request,response);

}

exports.commentsByUserRoute = function(appType, request, response) {
	var userId = request.params.uid;

	if (request.method === "GET") {
		queryES.getAllCommentByUserID(userId, request.params.page, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, comments: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}

	//deprecated, used POST in commentRoute instead

//	else if (request.method === "POST") {
//		queryES.addComment(request.body.comment, appType, function(result) {
//			response.writeHead(200, { 'Content-Type': 'application/json' });
//			response.end(JSON.stringify({ errorcode: 0 }));
//		});
//	}
}

exports.commentsByUser = function(request, response) {
	exports.commentsByUserRoute(0, request, response);
}

exports.commentVoteRoute = function(appType, request, response) {
	var commentId = request.params.uid;
	var direction = request.params.dir;

	console.log(direction);

	if (request.method === "POST") {
		queryES.updateVote(commentId, direction, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
		});
	}
}

exports.commentVote = function(request, response) {
	exports.commentVoteRoute(0, request, response);
}

exports.commentAnsweredRoute = function(appType, request, response) {
	var commentId = request.params.uid;

	if (request.method === "PUT") {
		queryES.updateIsAnswered(commentId, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
		});
	}
}

exports.commentAnswered = function(request, response) {
	exports.commentAnsweredRoute(0, request, response);
}

exports.commentsByQuestionRoute = function(appType, request, response) {
	var question_id = request.params.uid;

	if (request.method === "GET") {
		queryES.getCommentByTarget_uuid(question_id, request.params.page, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, comments: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	}
}

exports.commentsByQuestion = function(request, response) {
	exports.commentsByQuestionRoute(0, request, response);
}

exports.searchRoute = function(appType, request, response) {
	var query = request.body.query;


	if (request.method === "POST") {

		nlp(query, function(query){
			console.log('query after nlp parsing is: ' + query);

			queryES.searchAll(query, request.params.page, appType, function(result) {
				if (result) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, questions: result }));
				} else {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
				}
			});
		});
	}
}

exports.search = function(request, response) {
	exports.searchRoute(0, request, response);
}

