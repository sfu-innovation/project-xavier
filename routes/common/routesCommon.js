var courseModel = require("./../../models/course");

var User = require("../../models/user");
var UserProfile = require("../../models/userProfile");

//var SectionMaterial = require("../../models/sectionMaterial");

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
			if (err) {
				// Handle the error
	        	response.send({error: err});
	    	}
	    	
	    	//Todo: proper redirection to page after login
	    	else {
	        	// Log the user in and store user in the session
	        	User.selectUser({"userID":username}, function(error, user){
	        		if(!error){
	        			//If no user was found in the database, create a new one
	        			if(!user){
	        				var newUser = {
								firstName: ""
								, lastName: ""
								, userID: username
								, email: username + "@sfu.ca"
							}
	        				User.createUser(newUser, function(error, user){
	        					if(error){
		        					response.send(error);
	        					}
	        					else{
	        						request.session.user = user;
									response.send(request.session);
	        					}
	        				})

	        			}
						else{
							//what to do if user is found in database
							request.session.user = user;
							response.send(request.session);
						}
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

exports.userProfile = function(request,response){
	var user_id = request.params.id;

	if (request.method === "GET") {
		UserProfile.getUserProfile(user_id, function(error, result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, profile: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "User not found" }));
			}

		});

	}

	if (request.method === "PUT") {
		UserProfile.updateProfile(user_id, request.body, function(error, result) {
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

exports.userPreferredName = function(request, response) {
	if (request.method === "PUT") {
		if(request.session && request.session.user){
			User.setPreferedName(request.session.user.uuid, request.body.name, function(error, result) {
				if (result) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, users: result }));
				} else {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: "User not found" }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}
	}
}


exports.userQuery = function(request, response) {
	if (request.method === "POST" && request.body.where) {
		User.selectUser(request.body.where, function(error, result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, users: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "User not found" }));
			}
		});
	}
}

exports.userCourses = function(request, response) {

	if (request.method === "GET") {

		if(request.session && request.session.user){
			User.getUserCourses({ user: request.session.user.uuid }, function(error, result) {
				if (result) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, users: result }));
				} else {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: "User not found" }));
				}
			});
		}else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}
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


exports.courseMembers = function(request,response){
	var course_id = request.params.id;
	if (request.method === "GET") {
		courseModel.getCourseMembers({ course: course_id }, function(error, result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, members: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Course not found" }));
			}
		});
	}
}

exports.courseQuery = function(request, response) {
	if (request.method === "POST" && request.body.where) {
		courseModel.selectCourse(request.body.where, function(error, result) {
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, courses: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Course not found" }));
			}
		});
	}
}
/*
//section materials
exports.addResourceToSection = function(request, response){
	if(request.method === "POST"){
		SectionMaterial.createSectionMaterial(request.body, function(error, result){
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, sectionMaterial: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Section material not found" }));
			}
		})
	}
}

exports.updateResourceFromSectionToSection = function(request, response){}

exports.removeResourceFromSection = function(request, response){}
*/