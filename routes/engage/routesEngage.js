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