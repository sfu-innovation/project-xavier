var routesPresenter = require("./../rqra/routesPresenter.js");

var TagAction = require("./../../controller/TagAction.js");
var Tag = require("./../../models/tag");

exports.question = function(request, response) {
	routesPresenter.questionRoute(1, request, response);
}

exports.questions = function(request, response) {
	routesPresenter.questionsRoute(1, request, response);
}

exports.questionsByUser = function(request, response) {
	routesPresenter.questionsByUserRoute(1, request, response);
}

exports.followQuestion = function(request, response) {
	routesPresenter.followQuestionRoute(1, request, response);
}

exports.questionStatus = function(request, response) {
	routesPresenter.questionStatusRoute(1, request, response);
}



exports.comment = function(request, response) {
	routesPresenter.commentRoute(1, request, response);
}

exports.comments = function(request, response) {
	routesPresenter.commentsRoute(1, request, response);
}

exports.commentsByUser = function(request, response) {
	routesPresenter.commentsByUserRoute(1, request, response);
}

exports.commentVote = function(request, response) {
	routesPresenter.commentVoteRoute(1, request, response);
}

exports.commentAnswered = function(request, response) {
	routesPresenter.commentAnsweredRoute(1, request, response);
}

exports.commentsByQuestion = function(request, response) {
	routesPresenter.commentsByQuestionRoute(1, request, response);
}

exports.search = function(request, response) {
	routesPresenter.searchRoute(1, request, response);
}

exports.followQuestion = function(request, response) {
	routesPresenter.followQuestionRoute(1, request, response);
}

exports.unfollowQuestion = function(request, response) {
	routesPresenter.unfollowQuestionRoute(1, request, response);
}


//Tag

exports.tag = function(request,response){
	//TODO: replace this with seesion user	
	//request.body.tag.user = 'fakeid';
	if(request.method === 'POST'){
		TagAction.addTag(request.body.tag, function(error, result){
			if(result){				
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});

		/*
		Tag.createTag(request.body.tag, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});
		*/
	}
	else if (request.method === 'GET'){				
		console.log("good catch by jordan = " + request.params.id);
		
		TagAction.viewTags({'target':request.params.id}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		

		/*
		Tag.selectTag(request.body.tag, function(error,result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}

		})
		*/

	}
	else if (request.method === 'PUT'){
		TagAction.updateTag(request.body.tag, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});	

		/*				
		Tag.updateTag(request.body.tag, function(error,result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}

		})
		*/
	}
	else if (request.method === 'DELETE'){
		//TODO: no method found yet
		// coming soon...

	}


}

//deprecated

//exports.follower = function(request, response) {
//	var question_id = request.params.uid;
//	var follower_id = request.params.follower;
//
//	if (request.method === "PUT") {
//		response.writeHead(500, { 'Content-Type': 'application/json' });
//		response.end(JSON.stringify({ errorcode: 1, message: "Not Implemented" }));
//	} else if (request.method === "DELETE") {
//		response.writeHead(500, { 'Content-Type': 'application/json' });
//		response.end(JSON.stringify({ errorcode: 1, message: "Not Implemented" }));
//	}
//}