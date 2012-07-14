var routesPresenter = require("./../rqra/routesPresenter.js");

var TagAction = require("./../../controller/TagAction.js");
var MediaAction = require("./../../controller/MediaAction.js");

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


// Tag
exports.tag = function(request,response){

	if(request.method === 'POST'){

		if(request.session.user){
			request.body.user =  request.session.user.uuid;

			TagAction.addTag(request.body, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, resource: result }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}
	}
	else if (request.method === 'GET'){
		var uuid = request.params.id;
		TagAction.viewTags({'uuid':uuid}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
	else if (request.method === 'PUT'){		
		var uuid = request.params.id;
		TagAction.updateTag({'uuid':uuid}, request.body, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});	
	}
	else if (request.method === 'DELETE'){
		var uuid = request.params.id;
		TagAction.deleteTag({'uuid':uuid},function(error,result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		})
	}


}



exports.taggedQuestion = function(request,response){	
	if (request.method === 'GET'){		
		var questionID = request.params.qid;						
		TagAction.viewQuestionTagged({'question':questionID}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
}

exports.taggedComment = function(request,response){	
	if (request.method === 'GET'){		
		var commentID = request.params.cid;				
		TagAction.viewCommentTagged({'commentID':commentID}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
}

exports.taggedUser = function(request,response){	
	if (request.method === 'GET'){
		var userId = request.params.uid;								
		TagAction.getTaggedUser({'user':userId}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
}

// MediaFile
exports.mediafile = function(request,response){	
	if(request.method === 'POST'){
		MediaAction.addMediaFile(request.body, function(error, result){
			if(result){				
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});
	}
	else if (request.method === 'GET'){	
		var targetID = request.params.id;							
		MediaAction.viewMedia({'target':targetID}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
	else if (request.method === 'PUT'){		
		var targetID = request.params.id;
		MediaAction.updateMediaFile({'target':targetID}, request.body, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});	
	}
	else if (request.method === 'DELETE'){
		//TODO: no method found yet
		// coming soon...

	}


}

exports.mediafileTag = function(request,response){	
	if (request.method === 'GET'){
		var targetID = request.params.tid;								
		MediaAction.getMediaFileTags({'target':targetID}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
}

exports.mediafileUser = function(request,response){	
	if (request.method === 'GET'){
		var userId = request.params.uid;								
		MediaAction.getMediaFileUser({'user':userId}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resource: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
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