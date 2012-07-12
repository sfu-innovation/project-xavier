var Resource = require(__dirname + "/../../models/resource");

exports.followQuestion = function(request, response) {
	routesPresenter.followQuestionRoute(2, request, response);
}

exports.unfollowQuestion = function(request, response) {
	routesPresenter.unfollowQuestionRoute(2, request, response);
}

exports.createResource = function(request, response){
	if(request.method === 'POST'){
		console.log("POST");

		if(request.session.user){
			console.log(request.body);
			Resource.createResource(request.session.user.uuid, request.body.resource, function(error, result){
				console.log("RETURNED");
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
}