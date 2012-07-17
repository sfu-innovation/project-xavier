var Resource = require(__dirname + "/../../models/resource");
var Star = require(__dirname + "/../../models/star");
var Like = require(__dirname + "/../../models/like");
var routesPresenter = require("./../rqra/routesPresenter.js");

exports.followQuestion = function(request, response) {
	routesPresenter.followQuestionRoute(2, request, response);
}

exports.unfollowQuestion = function(request, response) {
	routesPresenter.unfollowQuestionRoute(2, request, response);
}

exports.getResource = function(request, response){
	if(request.method === 'GET'){
		Resource.getResourceByUUID(request.params.uuid, function(error, resource){
			if(error){
				 response.end(JSON.stringify({errorcode: 1, message: error}));
			}
			else{
				response.end(JSON.stringify({errorcode: 0, resource: resource}));
			}
		});
	}
}

exports.createResource = function(request, response){
	if(request.method === 'POST'){

		if(request.session && request.session.user){
			Resource.createResource(request.session.user.uuid, request.body.resource, function(error, result){
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

//Deletes the resource with the uuid provided in the response
exports.deleteResource = function(request, response){
	if(request.method === 'DELETE'){
		Resource.deleteResource(request.params.uuid, function(error, resource){
			if(error){
				response.end(JSON.stringify({ errorcode: 1, message: "Couldn't delete that resource"}));
			}
			else{
				response.end(JSON.stringify({errorcode: 0, message: "DELETED!"}));
			}
		})
	}
}


exports.starredResources = function(request, response){
	if(request.method === 'GET'){
		if(request.session && request.session.user){
			Star.getStarredResources(request.session.user.uuid, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, star: result }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}
	}
}

//resource uuid = request.body.uuid
exports.starResource = function(request, response){
	if(request.method === 'POST'){
		if(request.session && request.session.user){
			Star.starResource(request.session.user.uuid, request.body.uuid, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, star: result }));
				}else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.unstarResource = function(request, response){
	if(request.method === 'DELETE'){

		if(request.session && request.session.user){
			Star.unstarResource(request.session.user.uuid, request.body.uuid, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, star: result }));
				}else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.likeResource = function(request, response){
	if(request.method === 'POST'){
		if(request.session && request.session.user){
			Like.likeResource(request.session.user.uuid, request.body.uuid, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, resource: result }));
				}else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.unlikeResource = function(request, response){
	if(request.method === 'DELETE'){
		if(request.session && request.session.user){
			Like.unlikeResource(request.session.user.uuid, request.body.uuid, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, resource: result }));
				}else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}
}

exports.getLikes = function(request, response){
	if(request.method === 'GET'){
		Resource.getLikesByUUID(request.params.uuid, function(error, resourceLikes){
			if(error){
				response.end(JSON.stringify({errorcode:1, message: "Couldn't get likes for that resource"}));
			}
			else{
				response.end(JSON.stringify({errorcode: 0, likes: resourceLikes}));
			}
		})
	}
}







/////PUT REST CALLS ABOVE/////////////////////////////////
////////////NON-REST STUFF////////////////////////////////



var user_1 = {
	type: 0,
	firstName : "Gracey",
	lastName : "Mesina",
	userID : "3010123456",
	email : "gmesina@sfu.ca"
}

var user_2 = {
	type: 1,
	firstName : "Ted",
	lastName : "Kirkpatrick",
	userID : "3010111111",
	email : "ted@sfu.ca"
}

var userobject = {
	type : 0,
	firstName : "Catherine",
	lastName : "Tan",
	userID : 301078676,
	email : "llt3@sfu.ca",
	courses : {}
	}

var article_1 = {
	id : 1,
	user : user_1,
	url : "http://www.bbc.co.uk/news/science-environment-18716300",
	title :  "1South Korea unveils 'scientific' whaling proposal",
	author: "Richard Black",
	publishedDate : "4 July 2012",
	host : "http://www.bbc.co.uk",
	path : "/resources/articles/science-environment-18716300.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "May 6 2012,  12:30 PM PST",
	course: "CMPT 120",
	week : "1",
	likes: 5,
	description : "please read this for the midterm.",

}

var article_2 = {
	id : 2,
	user : user_2,
	url : "http://blog.spoongraphics.co.uk/tutorials/how-to-create-an-abstract-geometric-mosaic-text-effect",
	title :  "How To Create an Abstract Geometric Mosaic Text Effect",
	author: "Chris Spooner",
	publishedDate : "4 July 2012",
	host : "http://blog.spoongraphics.co.uk",
	path : "/resources/articles/how-to-create-an-abstract-geometric-mosaic-text-effect.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "July 16 2012,  12:30 AM PST",
	course: "CMPT 120",
	week : "4",
	likes: 2,
	description : "what?!",

}

var article_3 = {
	id : 3,
	user : user_1,
	url : "http://www.bbc.co.uk/news/science-environment-18716300",
	title :  "3South Korea unveils 'scientific' whaling proposal",
	author: "Richard Black",
	publishedDate : "4 July 2012",
	host : "http://www.bbc.co.uk",
	path : "/resources/articles/science-environment-18716300.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "July 12 2012,  12:30 PM PST",
	course: "IAT 200",
	week : "4",
	likes: 1,
	description : "Check out this article",
}


var article_4 = {
	id : 4,
	user : userobject,
	url : "http://www.bbc.co.uk/news/science-environment-18716300",
	title :  "4South Korea unveils 'scientific' whaling proposal",
	author: "Richard Black",
	publishedDate : "4 July 2012",
	host : "http://www.bbc.co.uk",
	path : "/resources/articles/science-environment-18716300.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "July 12 2012,  12:30 PM PST",
	course: "BUS 100",
	week : "1",
	likes: 4,
	description : "wow cool",
}

var article_5 = {
	id : 5,
	user : userobject,
	url : "http://www.forbes.com/sites/victorlipman/2012/06/28/how-to-interview-effectively",
	title :  "How To Interview Effectively",
	author: "Victor Lipman",
	publishedDate : "28 June 2012",
	host : "http://www.forbes.com",
	path : "/resources/articles/how-to-interview-effectively.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "July 15 2012,  12:30 PM PST",
	course: "IAT 200",
	week : "2",
	likes: 6,
	description : "what?!",

}

userobject.courses = {
		"CMPT 120" : [article_1, article_2],
		"BUS 100" : [article_4],
		"IAT 200" : [article_3, article_5]
	};


var articles = [article_1,  article_2,  article_3,  article_4,  article_5]



exports.index = function(req, res){
	console.log(article_3);
	res.render("engage/index", { 	title: "SFU ENGAGE",
		user :  userobject,
		status : "logged in" })

};

exports.articleView = function(req, res){
	var pickedArticle = articles[req.params.id - 1];

	res.render("engage/article", { title: "SFU ENGAGE",
		article : pickedArticle,
		user :  userobject,
		status : "logged in"	 })
}


