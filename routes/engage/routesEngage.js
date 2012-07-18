var Resource = require(__dirname + "/../../models/resource");
var Star = require(__dirname + "/../../models/star");
var Like = require(__dirname + "/../../models/like");
var routesCommon = require('./../common/routesCommon.js');
var http = require('http');
var request = require('request');
var fs = require('fs');
var jsdom = require('jsdom'), html5 = require('html5');
var crypto = require('crypto');


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

var article_1 = {
	id : 1,
	url : "http://www.bbc.co.uk/news/science-environment-18716300",
	title :  "1South Korea unveils 'scientific' whaling proposal",
	author: "Richard Black",
	published_date : "4 July 2012",
	host : "http://www.bbc.co.uk",
	path : "/resources/articles/science-environment-18716300.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "May 6 2012,  12:30 PM PST"
}

var article_2 = {
	id : 2,
	url : "http://blog.spoongraphics.co.uk/tutorials/how-to-create-an-abstract-geometric-mosaic-text-effect",
	title :  "How To Create an Abstract Geometric Mosaic Text Effect",
	author: "Chris Spooner",
	published_date : "4 July 2012",
	host : "http://blog.spoongraphics.co.uk",
	path : "/resources/articles/how-to-create-an-abstract-geometric-mosaic-text-effect.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "Jun 6 2012,  12:30 PM PST"
}

var article_3 = {
	id : 3,
	url : "http://www.bbc.co.uk/news/science-environment-18716300",
	title :  "3South Korea unveils 'scientific' whaling proposal",
	author: "Richard Black",
	published_date : "4 July 2012",
	host : "http://www.bbc.co.uk",
	path : "/resources/articles/science-environment-18716300.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "July 12 2012,  12:30 PM PST"
}


var article_4 = {
	id : 4,
	url : "http://www.bbc.co.uk/news/science-environment-18716300",
	title :  "4South Korea unveils 'scientific' whaling proposal",
	author: "Richard Black",
	published_date : "4 July 2012",
	host : "http://www.bbc.co.uk",
	path : "/resources/articles/science-environment-18716300.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "July 12 2012,  12:30 PM PST"
}

var article_5 = {
	id : 5,
	url : "http://www.forbes.com/sites/victorlipman/2012/06/28/how-to-interview-effectively",
	title :  "How To Interview Effectively",
	author: "Victor Lipman",
	published_date : "28 June 2012",
	host : "http://www.forbes.com",
	path : "/resources/articles/how-to-interview-effectively.html",
	uploaded_by : "Catherine Tan",
	uploaded_on : "July 15 2012,  12:30 PM PST",
	course: "cmpt120",
	week : "3"

}


var articles = [article_1,  article_2,  article_3,  article_4,  article_5]

var userobject = {
	name : "Catherine Tan",
	id : 301078676,
	courses : {
		"CMPT 120" : [article_1, article_2],
		"BUS 100" : [article_4],
		"IAT 200" : [article_3, article_5, article_1]
	}
}

function mediaPath(path, host){
	if (path.charAt(0)== "/"){
		return "http://" + host + path
	}
	else return path
}

function update_link(node, host) {
	var attrs = [
		'href',
		'src'];

	for (var i in attrs) {
		if (node.hasAttribute(attrs[i])) {
			var path = node.getAttribute(attrs[i])
			node.setAttribute(attrs[i], mediaPath(path, host));
		}
	}
}

function walk(node, host, cb) {
	//console.log(host)
	var notAllowed = [
		'SCRIPT',
		'NOSCRIPT',
		'H1'
		];

	var check = false;

	if (node.nodeType !== node.ELEMENT_NODE) {
		return;
	}
	if (node.hasAttribute('src') || node.hasAttribute('href')) {
		update_link(node, host);
	}
	//console.log('in walk: '+node.tagName)
	for(var i = 0; i < node.childNodes.length; ++i){

		if (~notAllowed.indexOf(node.childNodes[i].tagName) || node.childNodes[i].textContent.length === 0) {
			node.removeChild(node.childNodes[i]);
		}
		else if (typeof cb === 'function') {

			if (node.childNodes[i].textContent.length/node.textContent.length > .65) {	
				walk(node.childNodes[i], host, cb);
				check = true;
			}
		} else if (typeof cb === 'number') {

			//console.log('going into: '+node.childNodes[i].tagName)
			node.removeAttribute('class');
			node.removeAttribute('id');
			node.removeAttribute('style');
			walk(node.childNodes[i], host, cb);
		}


	}//------------end child loop

	if (typeof cb === 'function' && !check) {
		cb(node); 
	}
}

function listTypes(node, host) {

	var article = null

	walk(node, host, function(node) {
			
		//console.log(node.tagName)		
		article = node;	
		walk(article, host, 0);	
	})
	return article;
}



function articlize(document, name) {

	var published_date = document.querySelector('TIME').textContent,
		url = name.split("/"),
		fileName = crypto.createHash('md5').update(url[url.length-1]).digest('hex'),
		path = "./public/resources/articles/"+fileName+".xml",
		host = url[2];
		title = document.querySelector('H1').textContent;
	

	var stream = fs.createWriteStream(path);
	stream.once('open', function(fd) {

		stream.write('<title>'+title+'</title>\n')
		stream.write('<content>'+html5.serialize(listTypes(document.documentElement, host))+'</content>');

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

			articlize(window.document, req.body.article_url);
			
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

exports.article_view = function (req, res) {
	var pickedArticle = articles[req.params.id - 1];


	res.render("engage/article", { title:"SFU ENGAGE",

		user:userobject,
		status:"logged in"     })


}


