var queryES = require('./../../controller/queryES.js');
var question = require('./../../models/question.js');


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
		
	} else if (request.method === "PUT") {
		var questionBody = request.body.questionBody;
		queryES.updateQuestion(question_id, questionBody, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
		});
		
	} else if (request.method === "DELETE") {
		queryES.deleteQuestion(question_id, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
		});
	}
}

exports.question = function(request, response) {
	exports.questionRoute(0, request, response);
}


//get all questions
exports.questions = function(request, response) {
	if (request.method === "GET") {
		queryES.getAllQuestions( 0, function(result) {
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


exports.questionsByUserRoute = function(appType, request, response) {
	var userId = request.params.uid;
	
	if (request.method === "GET") {
		queryES.getAllQuestionByUserID(userId, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, questions: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	} else if (request.method === "POST") {
		queryES.addQuestion(request.body.question, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
		});
	}
}

exports.questionsByUser = function(request, response) {
	exports.questionsByUserRoute(0, request, response);
}

exports.followQuestionRoute = function(appType, request, response) {
	var questionId = request.params.uid;
	var followerId = request.params.follower;
	
	if (request.method === "PUT") {
		queryES.addFollower(questionId, followerId, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
		});
	}
}

exports.followQuestion = function(request, response) {
	exports.followQuestionRoute(0, request, response);
}

exports.questionStatusRoute = function(appType, request, response) {
	var questionId = request.params.uid;
	
	if (request.method === "PUT") {
		queryES.updateStatus(questionId, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
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
		
	} else if (request.method === "PUT") {
		var commentBody = request.body.commentBody;
		queryES.updateComment(comment_id, commentBody, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
		});
		
	} else if (request.method === "DELETE") {
		queryES.deleteComment(comment_id, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
		});
	}
}

exports.comment = function(request, response) {
	exports.commentRoute(0, request, response);
}

exports.commentsByUserRoute = function(appType, request, response) {
	var userId = request.params.uid;
	
	if (request.method === "GET") {
		queryES.getAllCommentByUserID(userId, appType, function(result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, comments: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Object not found" }));
			}
		});
	} else if (request.method === "POST") {
		queryES.addComment(request.body.comment, appType, function(result) {
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 0 }));
		});
	}
}

exports.commentsByUser = function(request, response) {
	exports.commentsByUserRoute(0, request, response);
}

exports.commentVoteRoute = function(request, response) {
	var commentId = request.params.uid;
	var direction = request.params.dir;
	
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

exports.commentAnsweredRoute = function(request, response) {
	var commentId = request.params.uid;
	var direction = request.params.dir;
	
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