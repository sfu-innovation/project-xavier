var Resource = require(__dirname + "/../../models/resource");
var Star = require(__dirname + "/../../models/star");
var Like = require(__dirname + "/../../models/like");
var routesCommon = require('./../common/routesCommon.js');
var http = require('http');
var request = require('request');
var fs = require('fs');
var jsdom = require('jsdom'), html5 = require('html5');


exports.followQuestion = function(request, response) {
	routesCommon.followQuestionRoute(2, request, response);
}

exports.unfollowQuestion = function(request, response) {
	routesCommon.unfollowQuestionRoute(2, request, response);
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
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
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
					response.end(JSON.stringify({ errorcode: 0, resources: result }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}
	}
}

//resource uuid = request.body.uuid
exports.starResource = function(request, response){
	var resource_uuid = request.params.id;
	if(request.method === 'POST'){
		if(request.session && request.session.user){
			Star.starResource(request.session.user.uuid, resource_uuid, function(error, result){
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
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.unstarResource = function(request, response){
	var resource_uuid = request.params.id;
	if(request.method === 'DELETE'){

		if(request.session && request.session.user){
			Star.unstarResource(request.session.user.uuid, resource_uuid, function(error, result){
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
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.likeResource = function(request, response){
	var resource_uuid = request.params.id;
	if(request.method === 'POST'){
		if(request.session && request.session.user){
			Like.likeResource(request.session.user.uuid, resource_uuid, function(error, result){
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
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.unlikeResource = function(request, response){
	var resource_uuid = request.params.id;
	if(request.method === 'DELETE'){
		if(request.session && request.session.user){
			Like.unlikeResource(request.session.user.uuid, resource_uuid, function(error, result){
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
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}

	}
}


//don't think this is needed.
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

exports.resourcesInSection = function(request, response){
	routesCommon.resourcesInSection(2, request, response);
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
	starred : 0

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
	starred : 1

}

var article_3 = {
	id : 3,
	user : user_1,
	url : "http://www.bbc.co.uk/news/uk-scotland-tayside-central-18873631",
	title :  "Naked rambler walks free from Perth Prison",
	author: "",
	publishedDate : "4 July 2012",
	host : "http://www.bbc.co.uk",
	path : "/resources/articles/uk-scotland-tayside-central-18873631.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "July 17 2012,  12:00 PM PST",
	course: "IAT 200",
	week : "4",
	likes: 10,
	description : "Check out this article",
	starred : 0
}


var article_4 = {
	id : 4,
	user : userobject,
	url : "http://www.bbc.co.uk/news/business-18867054",
	title :  "HSBC used by 'drug kingpins', says US Senate",
	author: "Paul Adams",
	publishedDate : "4 July 2012",
	host : "http://www.bbc.co.uk",
	path : "/resources/articles/business-18867054.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "July 17 2012,  12:30 PM PST",
	course: "BUS 100",
	week : "1",
	likes: 7,
	description : "wow cool",
	starred : 0
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
	starred : 1

}

userobject.courses = {
		"CMPT 120" : [article_1, article_2],
		"BUS 100" : [article_4],
		"IAT 200" : [article_3, article_5]
	};


var articles = [article_1,  article_2,  article_3,  article_4,  article_5]


function walk(node, cb) {

	var check = false;
	if (node.nodeType !== node.ELEMENT_NODE) {
		return;
	}

	for(var i = 0; i < node.childNodes.length; ++i){
		if (node.childNodes[i].tagName === 'SCRIPT' || node.childNodes[i].tagName === 'NOSCRIPT') {
			node.removeChild(node.childNodes[i]);
		}
		else if (node.childNodes[i].textContent.length/node.textContent.length > 0.55) {	
			walk(node.childNodes[i], cb);
			check = true;
		}
	}

	if (!check) {
		cb(node); 
	}
}

function listTypes(node) {
	var article = null

	walk(node, function(node) {
		for (var j = 0; j < node.childNodes.length; ++j) {
			var current = node.childNodes[j];
			//console.log('child node: '+current)
			if (current.nodeType === current.ELEMENT_NODE) {
				current.removeAttribute('class');
				current.removeAttribute('id');
				current.removeAttribute('style');
			}
		}		
		article = node;		
	})
	return article;
}

/*
function articlize(document) {
	var article = listTypes(document.documentElement)
}
*/

function get_article(document, name) {

	var stream = fs.createWriteStream("./public/resources/articles/"+name+".xml");
	stream.once('open', function(fd) {

		stream.write('<title>'+document.querySelector('H1').textContent+'</title>\n')
		stream.write('<content>'+html5.serialize(listTypes(document.documentElement))+'</content>');

	})
/*
	//for testing----------------
	return document.querySelectorAll(tag).map(function(node) {
		return "<p>"+node.textContent+"</p>";
	}).join("");
	//---------------------------
*/
}





exports.index = function(req, res){

	if (!req.body.article_url) {
		var error = "";
		if (req.method === 'POST') {
			error ="please enter an URL" ;
		}
		res.render("engage/index", { 	
							title: "SFU ENGAGE",
							user :  userobject, 
							status : "logged in",
							errormsg : error })
		return;
	}


	//var pathname = req.body.article_url.substring(0,pathname.lastIndexOf("/"));
	//console.log(req.body.article_url.split("/"));
	var parse_url = req.body.article_url.split("/");

	request(req.body.article_url, function (error, response, body) {

		if (response.statusCode == 200) {	
			var 
				window = jsdom.jsdom(null, null, {
					parser: html5,
					features: {
						QuerySelector: true
					}
				}).createWindow(),
				parser = new html5.Parser({document: window.document});

			parser.parse(body);

			get_article(window.document, parse_url[parse_url.length-1]);
			
		}
		
		res.render("engage/index", { 	title: "SFU ENGAGE",
								user :  userobject, 
								status : "logged in",
								errormsg : error })
	});
};

exports.starred = function (req, res) {
	if (req.session && req.session.user) {

		res.render("engage/starred", { 	title: "SFU ENGAGE",
			user :  userobject,
			status : "logged in" })
	}


	else {

		res.redirect("/login");
	}

}

exports.articleView = function (req, res) {
	var pickedArticle = articles[req.params.id - 1];


	res.render("engage/article", { title:"SFU ENGAGE",
		article : pickedArticle,
		user:userobject,
		status:"logged in"     })


}


