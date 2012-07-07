var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var courseModel = require("./../../models/course");
var User = require("../../models/user");

exports.index = function(request, response) {
	response.render('common/index', { title: "Homepage" });
}

exports.login = function(request, response) {
	var CAS = require('mikeklem-cas');
	var cas = new CAS({base_url: 'https://cas.sfu.ca/cgi-bin/WebObjects/cas.woa/wa/serviceValidate', service: 'http://'+request.headers['host']+'/login'});
	console.log('http://'+request.headers['host']+request.url);
	
	//Pass ticket to CAS Validation url, or redirect to the CAS login page to get a ticket
	var ticket = request.query["ticket"];
	if (ticket) {
		cas.validate(ticket, function(err, status, username) {
			console.log(status + " " + username);
			if (err) {
				// Handle the error
	        	response.send({error: err});
	    	}
	    	
	    	//Todo: proper redirection to page after login
	    	else {
	        	// Log the user in and store user in the session
	        	User.selectUser({"userID":username}, function(error, user){
	        		if(!error){
	        			request.session.user = user;
						response.send(request.session);
	        		}
	        		else{
	        			response.send(error);
	        		}
	        	});
	      	}
	    });
	} 
	else{
		var myService = require('querystring').stringify({
			service: 'http://'+request.headers['host']+request.url
		});
		response.redirect('https://cas.sfu.ca/cgi-bin/WebObjects/cas.woa/wa/login?' + myService);
	}
}

exports.user = function(request, response) {
	var user_id = request.params.id;
	
	if (request.method === "GET") {
		User.selectUser({ uuid: user_id }, function(error, result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, user: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "User not found" }));
			}
		});
	}
}

exports.course = function(request, response) {
	var course_id = request.params.id;
	
	if (request.method === "GET") {
		courseModel.selectCourse({ uuid: course_id }, function(error, result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, course: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Course not found" }));
			}
		});
	}
}