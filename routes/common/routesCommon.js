var User        = require(__dirname + "/../../models/user");
var UserProfile = require(__dirname + "/../../models/userProfile");
var Course      = require(__dirname + "/../../models/course");
var OrganizationAction = require(__dirname + "/../../controller/OrganizationAction");
var QueryES = require('./../../controller/queryES.js');
var nlp = require('./../../controller/nlp.js');
var question = require('./../../models/question.js');
var comment = require('./../../models/comment.js');
var NotificationAction = require(__dirname + "/../../controller/NotificationAction");
var UserNotificationSettings = require('../../models/userNotificationSettings.js');
var Week = require(__dirname + "/../../models/week.js");
var async = require('async');
var CourseMember = require(__dirname + "/../../models/courseMember");
var courseIdList = [11, 12, 13, 14];
var sanitizer = require('sanitizer');

exports.index = function(request, response) {
	response.render('common/index', { title: "Homepage" });
}

exports.logout = function(request, response) {
	console.log('loging out...');	
	request.session.destroy();	
	response.redirect('home');
}

var createUserNotification = exports.createUserNotification = function(args, callback){
	NotificationAction.createUserNotificationSettings(args, function(err, success){
		if(err)
			return callback(err);
		console.log("User notification setting - created")

		User.getUserCourses(args.user, function(err, result){
			if(err)
				return callback(err)

			console.log("Courses - Found")
			result.forEach(function(course){
				console.log("Course: " + course.subject + " " + course.number)
			});

			callback(null, result)
		})
	});
}

var createCoursesForUser = function(userId, callback){
	async.forEach(courseIdList, function(id, done){
		CourseMember.addCourseMember(userId, id, function(err,result){
			if(err)
				return callback(err)
			done();
		});
	}, function(err){
		if(err)
			return callback(err)
		console.log("Courses - Added to user: " + userId)
		async.forEach(courseIdList, function(course, done){
			var args = {
				target      : course,
				app         : 2
			}
			NotificationAction.setupCourseMaterialNotifiers(args, function(err, success){
				if(err)
					return callback(err)
				done();
			})
		}, function(err){
			if(err)
				return callback(err)
			console.log("Course material notification - created")
			callback(null)
		})
	})


}

//apptype is used to setup inital user notification setting
exports.login = function(appType, request, response) {
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
		        					return response.send(error);
	        					}else{
									//Add courses to user
									createCoursesForUser(user.uuid, function(err){
										if(err)
											return response.send(err)

										var args= {
											app:appType,
											user:user.uuid
										}
										createUserNotification(args, function(err, result){
											if(err){
												return response.send(err);
											}else{
												request.session.user = user;
												request.session.courses = result;
												response.redirect('/');
											}
										})
									})

	        					}
	        				})
	        			}
						else{
							//another createUserNotification here cuz users can have diff settings
							//across all apps
							var args= {
								app:appType,
								user:user.uuid
							}
							createUserNotification(args, function(err, result){
								if(err){
									response.send(error);
								}else{
									request.session.user = user;
									request.session.courses = result;
									response.redirect('/');
								}
							})
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
					response.end(JSON.stringify({ errorcode: 0, user: result }));
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
		User.selectUsers(request.body.where, function(error, result) {
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
			User.getUserCourses(request.session.user.uuid, function(error, result) {
				if (result) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, courses: result }));
				} else if(error){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, courses: [] }));
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
		Course.selectCourse({ uuid: course_id }, function(error, result) {
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
		Course.getCourseMembers(course_id, function(error, result) {
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
		Course.selectCourses(request.body.where, function(error, result) {
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

exports.courseInstructor = function(request, response){
	var course_id = request.params.id;
	if(request.method === "GET"){
		Course.getInstructor(course_id, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, instructor: result }));
			}
			else if(error){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Instructor not found" }));
			}
		})
	}
}

exports.courseResources = function(request, response){
	var course_id = request.params.id;
	if(request.method === "GET"){
		OrganizationAction.getResourcesByCourseUUID({course:course_id}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, instructor: result }));
			}
			else if(error){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Instructor not found" }));
			}
		})
	}
}

//section materials
exports.addResourceToSection = function(request, response){
	if(request.method === "POST"){
		OrganizationAction.addResourceToSection(request.body, function(error, result){
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, sectionMaterial: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		})
	}
}

exports.updateResourceFromSectionToSection = function(request, response){
	if(request.method === "PUT"){
		OrganizationAction.updateResourceFromSectionToSection(request.body, function(error, result){
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, sectionMaterial: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Failed to update resource to new section" }));
			}
		})
	}
}

exports.removeResourceFromSection = function(request, response){
	if(request.method === "DELETE"){
		OrganizationAction.removeResourceFromSection(request.body, function(error, result){
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, sectionMaterial: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Failed to remove resource from section" }));
			}
		})
	}
}

exports.addSection = function(request, response){
	if(request.method === "POST"){
		OrganizationAction.addSection(request.body, function(error, result){
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, section: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Failed to add section" }));
			}
		})
	}
}

exports.updateSection = function(request, response){
	if(request.method === "PUT"){
		OrganizationAction.updateSection(request.body, function(error, result){
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, section: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Failed to update section" }));
			}
		})
	}
}
exports.removeSection = function(request, response){
	if(request.method === "DELETE"){
		OrganizationAction.removeSection(request.body, function(error, result){
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, section: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Failed to remove section" }));
			}
		})
	}
}

exports.sectionsInCourse = function(request, response){
	if(request.method === "POST"){
		OrganizationAction.sectionsInCourse(request.body, function(error, result){
			if (result) {
				console.log(JSON.stringify(result));
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, sectionsInCourse: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Failed to get all sections in a course" }));
			}
		})
	}
}

exports.resourcesInSection = function(appType, request, response){
	if(request.method === "POST"){
		var args = request.body;
		args.appType = appType;

		OrganizationAction.resourcesInSection(args, function(error, result){
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, resourcesInSection: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Failed to get all resources in a section" }));
			}
		})
	}
}

exports.numberOfResourcesInCourse = function(request, response){
	if(request.method === "POST"){
		OrganizationAction.numberOfResourcesInCourse(request.body, function(error, result){
			if (result) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, numberOfResourcesInCourse: result }));
			} else {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: "Failed to get count of resources in a course" }));
			}
		})
	}
}


//increment the view count for a question
//@params request.params.uid
exports.questionViewCountRoute = function(appType, request, response){
	if (request.method === "PUT") {
		var uuid = request.params.uid;
		QueryES.questionViewCount(uuid, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, question: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, question: "Failed to update vote count" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: questionViewCount' }));
			}
		});

	}
}

//TODO:deprecated
exports.instructorQuestionsRoute = function(appType, request, response){
	if (request.method === "GET") {
		QueryES.getInstructorQuestion(appType, request.params.page, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, question: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, question: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getInstructorQuestion' }));
			}
		});

	}
}

exports.questionRoute = function(appType, request, response) {
	var question_id = request.params.uid;
	if (request.method === "GET") {
		QueryES.getQuestion(question_id, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, question: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, question: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getQuestion' }));
			}
		});

	}

	//post a new question
	else if (request.method === "POST"){
		//if not log in, cannot create a question
		if(request.session && request.session.user){
			var title = sanitizer.sanitize(request.body.question.title)
			var body = sanitizer.sanitize(request.body.question.body)

			if(title){
				var newQuestion = new question(request.session.user.uuid
					,title
					,body
					,request.body.question.category);

				newQuestion.course = request.session.course;
				newQuestion.week = parseInt(request.session.week);

				QueryES.addQuestion(newQuestion, appType, function(err, result) {
					if (!err) {
						response.writeHead(200, { 'Content-Type': 'application/json' });
						if(result){
							response.end(JSON.stringify({ errorcode: 0, question: result }));
						}
						else{
							response.end(JSON.stringify({ errorcode: 0, question: "Failed to add a question" }));
						}
					} else {
						response.writeHead(500, { 'Content-Type': 'application/json' });
						response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: addQuestion' }));
					}
				});
			}else{
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Invalid title or body' }));
			}
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}

	else if (request.method === "PUT") {
		var questionTitle = sanitizer.sanitize(request.body.title);
		var questionBody = sanitizer.sanitize(request.body.body);

		if(questionTitle){
			QueryES.updateQuestion(question_id,questionTitle,questionBody, appType, function(err, result) {
				if (!err) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					if(result){
						response.end(JSON.stringify({ errorcode: 0, question: result }));
					}
					else{
						response.end(JSON.stringify({ errorcode: 0, question: "Failed to update question" }));
					}
				} else {
					response.writeHead(500, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: updateQuestion' }));
				}
			});
		}else{
			response.writeHead(500, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'Invalid title or body' }));
		}
	} else if (request.method === "DELETE") {
		QueryES.deleteQuestion(question_id, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, question: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, question: "Failed to delete question" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: deleteQuestion' }));
			}
		});
	}
}

exports.questionsRoute = function(appType, request, response){
	if (request.method === "GET") {
		QueryES.getAllQuestions( appType, request.params.page, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, questions: result }));					
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, questions: "No questions found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getAllQuestions' }));
			}
		});
	}

}

//TODO:deprecated
exports.questionsUnansweredRoute = function(appType, request, response){
	if (request.method === "GET") {
		QueryES.getAllUnansweredQuestions( appType, request.params.page, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, questions: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, questions: "No questions found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getAllUnansweredQuestions' }));
			}
		});
	}
}

//TODO:deprecated
exports.questionsNewRoute = function(appType, request, response){
	if (request.method === "GET") {
		QueryES.getAllNewQuestions( appType, request.params.page, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, questions: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, questions: "No questions found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getAllNewQuestions' }));
			}
		});
	}
}

exports.questionsAnsweredRoute = function(appType, request, response){
	if (request.method === "GET") {
		QueryES.getAllRecentlyAnsweredQuestions( appType, request.params.page,function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, questions: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, questions: "No questions found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getAllRecentlyAnsweredQuestions' }));
			}
		});
	}
}

exports.questionsByUserRoute = function(appType, request, response) {
	var userId = request.params.uid;

	if (request.method === "GET") {
		QueryES.getAllQuestionByUserID(userId, request.params.page, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, questions: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, questions: "No questions found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getAllQuestionsByUserID' }));
			}
		});
	}
}

exports.followQuestionRoute = function(appType, request, response) {
	if (request.method === "PUT") {
		if(request.session && request.session.user){
			QueryES.addFollower(request.params.uid, request.session.user.uuid, appType, function(err, result) {
				if (!err) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					if(result){
						response.end(JSON.stringify({ errorcode: 0, question: result }));
					}
					else{
						response.end(JSON.stringify({ errorcode: 0, question: "Failed to follow question" }));
					}
				} else {
					response.writeHead(500, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: addFollower' }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}

	}
}

exports.unfollowQuestionRoute = function(appType, request, response) {
	if (request.method === "PUT") {
		if(request.session && request.session.user){
			QueryES.removeFollower(request.params.uid, request.session.user.uuid, appType, function(err, result) {
				if (!err) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					if(result){
						response.end(JSON.stringify({ errorcode: 0, question: result }));
					}
					else{
						response.end(JSON.stringify({ errorcode: 0, question: "Failed to unfollow question" }));
					}
				} else {
					response.writeHead(500, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: removeFollower' }));
				}
			});
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}
	}
}

exports.questionStatusRoute = function(appType, request, response) {
	if (request.method === "PUT") {
		QueryES.updateStatus(request.params.uid, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, question: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, question: "Cannot update status" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: updateStatus' }));
			}
		});
	}
}

exports.commentRoute = function(appType, request, response) {
	if (request.method === "GET") {
		QueryES.getComment(request.params.uid, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, comment: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, comment: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getComment' }));
			}
		});
	} else if (request.method === "POST"){
		if(request.session && request.session.user){
			var body = sanitizer.sanitize(request.body.comment.body)

			if(body){
				var newComment = new comment(
					request.body.comment.target_uuid
					,request.session.user.uuid
					,request.body.comment.objectType
					,body);

				QueryES.addComment(newComment, request.session.user, appType, function(err, result) {
					if (!err) {
						response.writeHead(200, { 'Content-Type': 'application/json' });
						if(result){
							response.end(JSON.stringify({ errorcode: 0, comment: result }));
						}
						else{
							response.end(JSON.stringify({ errorcode: 0, comment: "Failed to add a comment" }));
						}
					} else {
						response.writeHead(500, { 'Content-Type': 'application/json' });
						response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: addComment' }));
					}
				});
			}else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Invalid body' }));
			}
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'You aren\'t logged in' }));
		}
	} else if (request.method === "PUT") {
		var body = sanitizer.sanitize(request.body.body)

		if(body){
			QueryES.updateComment(request.params.uid, body, appType, function(err, result) {
				if (!err) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					if(result){
						response.end(JSON.stringify({ errorcode: 0, comment: result }));
					}
					else{
						response.end(JSON.stringify({ errorcode: 0, comment: "Failed to update comment" }));
					}
				} else {
					response.writeHead(500, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: updateComment' }));
				}
			});

		}else {
			response.writeHead(500, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: updateStatus' }));
		}

	} else if (request.method === "DELETE") {
		QueryES.deleteComment(request.params.uid, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, comment: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, comment: "Failed to delete comment" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: deleteComment' }));
			}
		});
	}
}

exports.commentsRoute = function(appType,request,response){
	if (request.method === "GET") {
		QueryES.getAllComments(appType, request.params.page, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, comments: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, comments: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getAllComments' }));
			}

		});
	}else if(request.method === "DELETE"){
		QueryES.deleteComments(request.body.commentList, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, comments: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, comments: "No comments deleted" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: deleteComments' }));
			}
		})
	}
}

exports.commentsByUserRoute = function(appType, request, response) {
	if (request.method === "GET") {
		QueryES.getAllCommentByUserID(request.params.uid, request.params.page, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, comments: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, comments: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getAllCommentByUserID' }));
			}
		});
	}
}

exports.commentVoteRoute = function(appType, request, response) {
	if (request.method === "PUT") {
		QueryES.updateVote(request.params.uid, request.params.dir, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, comment: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, comment: "Failed to update vote" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: updateVote' }));
			}
		});
	}
}

//TODO:deprecated
exports.commentAnsweredRoute = function(appType, request, response) {
	if (request.method === "PUT") {
		QueryES.updateIsAnswered(request.params.uid, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, comment: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, comment: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: updateIsAnswered' }));
			}
		});
	}
}

exports.commentsByQuestionRoute = function(appType, request, response) {
	if (request.method === "GET") {
		QueryES.getCommentByTarget_uuid(request.params.uid, request.params.page, appType, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, comments: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, comments: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getCommentByTarget_uuid' }));
			}
		});
	}
}

exports.commentCount = function(appType, request, response){
	if (request.method === "GET") {
		QueryES.getCommentCount(appType, request.params.uid, function(err, result) {
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, comments: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, comments: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: getCommentCount' }));
			}
		});
	}
}

//TODO:deprecated, use searchQuestionsRoute
exports.searchRoute = function(appType, request, response) {
	var query = request.body.query;

	if (request.method === "POST") {

		nlp(query, function(query){
			console.log('query after nlp parsing is: ' + query);

			QueryES.searchAll(query, request.params.page, appType, function(err, result) {
				if (!err) {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					if(result){
						response.end(JSON.stringify({ errorcode: 0, questions: result }));
					}
					else{
						response.end(JSON.stringify({ errorcode: 0, questions: "No questions found" }));
					}
				} else {
					response.writeHead(500, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: searchAll' }));
				}
			});
		});
	}
}


/****NEW Question sort stuff*/
exports.searchQuestionsRoute = function(appType, request, response){
	var queryData = request.body;

	if (request.method === "POST") {
		if(request.session.user){/*
			nlp(queryData.searchQuery, function(query){
				if(query){
			 		queryData.searchQuery = queryData.searchQuery + " " +  query;
				}*/
				queryData.uuid = request.session.user.uuid;
				QueryES.searchQuestionsRoute(appType, request.params.page, queryData, function(err, result){
					if (!err) {
						response.writeHead(200, { 'Content-Type': 'application/json' });
						if(result){
							response.end(JSON.stringify({ errorcode: 0, questions: result }));
						}
						else{
							response.end(JSON.stringify({ errorcode: 0, questions: "No questions found" }));
						}
					} else {
						response.writeHead(500, { 'Content-Type': 'application/json' });
						response.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: searchQuestionsRoute' }));
					}
				});/*
			});*/
		}
	}
}

//Notifications
exports.updateUserNotifications = function(appType, request, response){
	if (request.method === "PUT") {
		args = {
			user: request.session.user.uuid
			, app:appType
			, notificationOnNewResource: request.body.notificationOnNewResource
			, notificationOnLike: request.body.notificationOnLike
			, notificationOnComment: request.body.notificationOnComment
			, notificationOnStar:request.body.notificationOnStar}

		NotificationAction.updateUserNotificationSettings(args, function(err, result){
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, notification: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, notification: "Failed to update user notification" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: err }));
			}
		});
	}
}

exports.getResourceSection = function(request, response){
	if(request.method === "GET"){
		var args = {
			material: request.params.uid
		}

		OrganizationAction.getSectionTitleByResourceUUID(args, function(error, section){
			if(!error){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, section: section }));
			}
			else{
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		})
	}
}

exports.getWeekByCourseId = function(appType, request, response){
	if(request.method === "GET"){
		var id = request.params.id;
		Week.findAllWeeks({course:id}, function (error, result) {
			if (!error) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, week: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, week: "No results found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, week: error }));
			}
		})
	}
}

exports.addWeek = function(appType, request, response){
	if(request.method === "POST"){
		var week = {
			course: request.body.course,
			week:request.body.week,
			topic:request.body.topic,
			app: appType
		}

		Week.createWeek(week, function (error, result) {
			if (!error) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, week: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, week: "Cannot create week" }));
				}
			}
			else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, week: error }));
			}
		})
	}
}

exports.getUserNotifications = function(appType, request, response){
	if (request.method === "GET") {
		var args = {
			user : request.params.uid,
			app  : appType
		}
		NotificationAction.retrieveUserNotificationsByUser(args, function(err, result){
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, notification: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, notification: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: err }));
			}
		})
	}
}

exports.removeCommentNotifier = function(appType, request, response){
	if (request.method === "DELETE") {
		var args = {
			user : request.params.uid,
			target : request.params.qid,
			app  : appType
		}
		console.log(JSON.stringify(args))
		NotificationAction.removeCommentNotifier(args, function(err, result){
			if (!err) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){
					response.end(JSON.stringify({ errorcode: 0, notification: result }));
				}
				else{
					response.end(JSON.stringify({ errorcode: 0, notification: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: err }));
			}
		})
	}
}
