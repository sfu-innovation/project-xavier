var Resource = require(__dirname + "/../../models/resource");

exports.follower = function(request, response) {
	var resource_id = request.params.uid;
	var follower_id = request.params.follower;

	if (request.method === "PUT") {
		response.writeHead(500, { 'Content-Type': 'application/json' });
		response.end(JSON.stringify({ errorcode: 1, message: "Not Implemented" }));
	} else if (request.method === "DELETE") {
		response.writeHead(500, { 'Content-Type': 'application/json' });
		response.end(JSON.stringify({ errorcode: 1, message: "Not Implemented" }));
	}
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