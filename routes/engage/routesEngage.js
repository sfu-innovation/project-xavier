var EngageAction =   require('../../controller/EngageAction');
var Parser = require('../../controller/Parser');
var Resource = require(__dirname + "/../../models/resource");
var ProfileSettings = require('../../controller/ProfileSettings')
var Star = require(__dirname + "/../../models/star");
var Like = require(__dirname + "/../../models/like");
var User = require(__dirname + "/../../models/user");
var UserProfile = require(__dirname + "/../../models/userProfile");
var Course = require(__dirname + "/../../models/course");
var CourseMember = require(__dirname + "/../../models/courseMember");
var Week = require(__dirname + "/../../models/week");
var routesCommon = require('./../common/routesCommon.js');
var http = require('http');
var request = require('request');
var jsdom = require('jsdom'), html5 = require('html5');
var crypto = require('crypto');
var notification = require('../../controller/NotificationAction.js');
var async = require('async');
var QueryES = require('./../../controller/queryES.js');
var Comment = require('./../../models/comment.js');

exports.login = function (request, response) {
	routesCommon.login(2, request, response);
}


exports.createComment = function (req,res){

	if(req.session && req.session.user){
		var newComment = new Comment(
			req.body.target_uuid
			,req.session.user.uuid
			,req.body.objectType
			,req.body.body, req.body.parent_uuid);

		QueryES.addComment(newComment, req.session.user, 2, function(err, result) {


			if (!err) {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				if(result){

					QueryES.getComment(result._id,2,function(err,data){
						EngageAction.commentHelper(data,function(err,data){
							res.end(JSON.stringify({ errorcode: 0, comment: data }));
						})



					})

				}
				else{
					res.end(JSON.stringify({ errorcode: 0, comment: "Failed to add a comment" }));
				}
			} else {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ errorcode: 1, message: 'Elasticsearch error: addComment' }));
			}
		});
	}
	else{
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
	}

}



exports.followQuestion = function (request, response) {
	routesCommon.followQuestionRoute(2, request, response);
}

exports.unfollowQuestion = function (request, response) {
	routesCommon.unfollowQuestionRoute(2, request, response);
}

exports.getResource = function (request, response) {
	if (request.method === 'GET') {
		Resource.getResourceByUUID(request.params.uuid, function (error, resource) {
			if (error) {
				response.end(JSON.stringify({errorcode:1, message:error}));
			}
			else {
				response.end(JSON.stringify({errorcode:0, resource:resource}));
			}
		});
	}
}

exports.createResource = function (request, response) {
	if (request.method === 'POST') {

		if (request.session && request.session.user) {
			Resource.createResource(request.session.user.uuid, request.body.resource, function (error, result) {
				if (result) {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:0, resource:result }));
				}
				else {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:1, message:error }));
				}
			});
		}
		else {
			response.writeHead(200, { 'Content-Type':'application/json' });
			response.end(JSON.stringify({ errorcode:2, message:'You aren\'t logged in' }));
		}
	}
}

//Deletes the resource with the uuid provided in the response
exports.deleteResource = function (request, response) {
	if (request.method === 'DELETE') {
		Resource.deleteResource(request.params.uuid, function (error, resource) {
			if (error) {
				response.end(JSON.stringify({ errorcode:1, message:"Couldn't delete that resource"}));
			}
			else {
				response.end(JSON.stringify({errorcode:0, message:"DELETED!"}));
			}
		})
	}
}


exports.starredResources = function (req, res) {
	if (req.method === 'GET') {
		if (req.session && req.session.user) {
			Star.getStarredResources(req.session.user.uuid, function (error, result) {
				if (result) {
					EngageAction.resourceHelper(req.session.user, result, function (error, result) {
						res.writeHead(200, { 'Content-Type':'application/json' });
						res.end(JSON.stringify({ errorcode:0, resources:result }));
					})
				}
				else {
					res.writeHead(200, { 'Content-Type':'application/json' });
					res.end(JSON.stringify({ errorcode:1, message:error }));
				}
			});
		} else {
			res.writeHead(200, { 'Content-Type':'application/json' });
			res.end(JSON.stringify({ errorcode:2, message:'You aren\'t logged in' }));
		}
	}
}

//resource uuid = request.body.uuid
exports.starResource = function (request, response) {
	var resource_uuid = request.params.id;
	if (request.method === 'POST') {
		if (request.session && request.session.user) {
			Star.starResource(request.session.user.uuid, resource_uuid, function (error, result) {
				if (result) {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:0, star:result }));
				} else {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:1, message:error }));
				}
			});
		} else {
			response.writeHead(200, { 'Content-Type':'application/json' });
			response.end(JSON.stringify({ errorcode:2, message:'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.unstarResource = function (request, response) {
	var resource_uuid = request.params.id;
	if (request.method === 'DELETE') {

		if (request.session && request.session.user) {
			Star.unstarResource(request.session.user.uuid, resource_uuid, function (error, result) {
				if (result) {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:0, star:result }));
				} else {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:1, message:error }));
				}
			});
		} else {
			response.writeHead(200, { 'Content-Type':'application/json' });
			response.end(JSON.stringify({ errorcode:2, message:'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.likeResource = function (request, response) {
	var resource_uuid = request.params.id;
	if (request.method === 'POST') {
		if (request.session && request.session.user) {
			Like.likeResource(request.session.user.uuid, resource_uuid, function (error, result) {
				if (result) {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:0, resource:result }));
				} else {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:1, message:error }));
				}
			});
		} else {
			response.writeHead(200, { 'Content-Type':'application/json' });
			response.end(JSON.stringify({ errorcode:2, message:'You aren\'t logged in' }));
		}

	}
}

//resource uuid = request.body.uuid
exports.unlikeResource = function (request, response) {
	var resource_uuid = request.params.id;
	if (request.method === 'DELETE') {
		if (request.session && request.session.user) {
			Like.unlikeResource(request.session.user.uuid, resource_uuid, function (error, result) {
				if (result) {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:0, resource:result }));
				} else {
					response.writeHead(200, { 'Content-Type':'application/json' });
					response.end(JSON.stringify({ errorcode:1, message:error }));
				}
			});
		} else {
			response.writeHead(200, { 'Content-Type':'application/json' });
			response.end(JSON.stringify({ errorcode:2, message:'You aren\'t logged in' }));
		}

	}
}


//don't think this is needed.
exports.getLikes = function (request, response) {
	if (request.method === 'GET') {
		Resource.getLikesByUUID(request.params.uuid, function (error, resourceLikes) {
			if (error) {
				response.end(JSON.stringify({errorcode:1, message:"Couldn't get likes for that resource"}));
			}
			else {
				response.end(JSON.stringify({errorcode:0, likes:resourceLikes}));
			}
		})
	}
}

exports.resourcesInSection = function (request, response) {
	routesCommon.resourcesInSection(2, request, response);
}


exports.resourcesInCourse = function (req, res) {

	if (req.session && req.session.user && req.session.courses) {
		var course_uuid = req.params.id;
		var user_uuid = req.session.user.uuid;
		var courses = req.session.courses;
		var found = 0;
		courses.forEach(function (course) {
			if (course.uuid === course_uuid) {
				found = 1;
			}
			;
		})

		if (found) {
			Resource.getResourcesByCourseUUIDs({courses:[course_uuid]}, function (error, result) {

				if (result) {
					EngageAction.resourceHelper(req.session.user, result, function (error, result) {
						res.writeHead(200, { 'Content-Type':'application/json' });
						res.end(JSON.stringify({ errorcode:0, resources:result }));
					})
				} else {
					res.writeHead(200, { 'Content-Type':'application/json' });
					res.end(JSON.stringify({ errorcode:1, message:error }));
				}


			})
		}

		else {
			res.writeHead(401, { 'Content-Type':'application/json' });
			res.end(JSON.stringify({ errorcode:3, message:'You are not enrolled in this course' }));
		}
	}

	else {
		req.writeHead(401, { 'Content-Type':'application/json' });
		res.end(JSON.stringify({ errorcode:2, message:'You aren\'t logged in' }));
	}


}

exports.resourcesInCourseByWeek = function (req, res) {

	if (req.session && req.session.user && req.session.courses) {
		var course_uuid = req.params.id;
		var user_uuid = req.session.user.uuid;
		var courses = req.session.courses;
		var found = 0;
		var weekNum = req.params.week;
		courses.forEach(function (course) {
			if (course.uuid === course_uuid) {
				found = 1;
			}
			;
		})

		if (found) {

			Resource.getResourcesByCourseUUIDsAndWeek({week:weekNum, courses:[course_uuid]}, function (error, result) {

				if (result) {
					EngageAction.resourceHelper(req.session.user, result, function (error, result) {
						res.writeHead(200, { 'Content-Type':'application/json' });
						res.end(JSON.stringify({ errorcode:0, resources:result }));
					})
				} else {
					res.writeHead(200, { 'Content-Type':'application/json' });
					res.end(JSON.stringify({ errorcode:1, message:error }));
				}


			})
		}

		else {
			res.writeHead(401, { 'Content-Type':'application/json' });
			res.end(JSON.stringify({ errorcode:3, message:'You are not enrolled in this course' }));
		}
	}

	else {
		req.writeHead(401, { 'Content-Type':'application/json' });
		res.end(JSON.stringify({ errorcode:2, message:'You aren\'t logged in' }));
	}


}




exports.resourcesInCourses = function (req, res) {
	var CourseUUIDs = [];

	var Courses = req.session.courses;
	for (index in Courses) {
		CourseUUIDs.push(Courses[index].uuid);
	}


	Resource.getResourcesByCourseUUIDs({courses:CourseUUIDs}, function (error, result) {

		if (result) {
			EngageAction.resourceHelper(req.session.user, result, function (error, result) {
				res.writeHead(200, { 'Content-Type':'application/json' });
				res.end(JSON.stringify({ errorcode:0, resources:result }));
			})
		} else {
			res.writeHead(200, { 'Content-Type':'application/json' });
			res.end(JSON.stringify({ errorcode:1, message:error }));
		}


	})
}


exports.resourcesInCoursesByWeek = function (req, res) {
	var CourseUUIDs = [];

	var Courses = req.session.courses;
	for (index in Courses) {
		CourseUUIDs.push(Courses[index].uuid);
	}

	var weekNum = req.params.week;

	Resource.getResourcesByCourseUUIDsAndWeek({week:weekNum, courses:CourseUUIDs}, function (error, result) {

		if (result) {
			EngageAction.resourceHelper(req.session.user, result, function (error, result) {
				res.writeHead(200, { 'Content-Type':'application/json' });
				res.end(JSON.stringify({ errorcode:0, resources:result }));
			})

		} else {
			res.writeHead(200, { 'Content-Type':'application/json' });
			res.end(JSON.stringify({ errorcode:1, message:error }));
		}


	})
}


exports.courseWeekInfo = function(req,res){
	var id = req.params.id;
	var weekNum = req.params.week;


	Week.selectWeek({course:id,week:weekNum}, function (error, result) {

		if (result) {

			res.writeHead(200, { 'Content-Type':'application/json' });
			res.end(JSON.stringify({ errorcode:0, week:result }));

		} else {
			res.writeHead(200, { 'Content-Type':'application/json' });
			res.end(JSON.stringify({ errorcode:1, message:error }));
		}


	})

}



exports.resourcesOfUser = function(req,res){

	Resource.getResourceByUserId({user:req.params.id}, function (error, result) {

		if (result) {
			EngageAction.resourceHelper(req.session.user, result, function (error, result) {
				res.writeHead(200, { 'Content-Type':'application/json' });
				res.end(JSON.stringify({ errorcode:0, resources:result }));
			})
		} else {
			res.writeHead(200, { 'Content-Type':'application/json' });
			res.end(JSON.stringify({ errorcode:1, message:error }));
		}


	})

}

// get resources that uploaded by current user
exports.resourcesOfCurrentUser = function (req, res) {
	if (req.session && req.session.user) {
		Resource.getResourceByUserId({user:req.session.user.uuid}, function (error, result) {

			if (result) {
				EngageAction.resourceHelper(req.session.user, result, function (error, result) {
					res.writeHead(200, { 'Content-Type':'application/json' });
					res.end(JSON.stringify({ errorcode:0, resources:result }));
				})
			} else {
				res.writeHead(200, { 'Content-Type':'application/json' });
				res.end(JSON.stringify({ errorcode:1, message:error }));
			}


		})

	}
	else {
		response.writeHead(401, { 'Content-Type':'application/json' });
		response.end(JSON.stringify({ errorcode:2, message:'You aren\'t logged in' }));
	}

}


/////PUT REST CALLS ABOVE/////////////////////////////////
////////////NON-REST STUFF////////////////////////////////


var user_1 = {
	type:0,
	firstName:"Gracey",
	lastName:"Mesina",
	userID:"3010123456",
	email:"gmesina@sfu.ca"
}

var user_2 = {
	type:1,
	firstName:"Ted",
	lastName:"Kirkpatrick",
	userID:"3010111111",
	email:"ted@sfu.ca"
}

var userobject = {
	type:0,
	firstName:"Catherine",
	lastName:"Tan",
	userID:301078676,
	email:"llt3@sfu.ca",
	courses:{}
}

var article_1 = {
	id:1,
	user:user_1,
	url:"http://www.bbc.co.uk/news/science-environment-18716300",
	title:"South Korea unveils 'scientific' whaling proposal",
	author:"Richard Black",
	publishedDate:"4 July 2012",
	host:"http://www.bbc.co.uk",
	path:"/resources/articles/5c7bb63a68886ac1d159bccc71488927.xml",
	uploaded_by:"Catherine Tan",
	uploaded_on:"May 6 2012,  12:30 PM PST",
	course:"CMPT120",
	week:"1",
	likes:5,
	description:"please read this for the midterm.",
	starred:0

}

var article_2 = {
	id:2,
	user:user_2,
	url:"http://blog.spoongraphics.co.uk/tutorials/how-to-create-an-abstract-geometric-mosaic-text-effect",
	title:"How To Create an Abstract Geometric Mosaic Text Effect",
	author:"Chris Spooner",
	publishedDate:"4 July 2012",
	host:"http://blog.spoongraphics.co.uk",
	path:"/resources/articles/f0f778a5204856f6d9bfb704ca389eb4.xml",
	uploaded_by:"Catherine Tan",
	uploaded_on:"July 16 2012,  12:30 AM PST",
	course:"CMPT120",
	week:"4",
	likes:2,
	description:"what?!",
	starred:1

}

var article_3 = {
	id:3,
	user:user_1,
	url:"http://www.bbc.co.uk/news/uk-scotland-tayside-central-18873631",
	title:"Naked rambler walks free from Perth Prison",
	author:"",
	publishedDate:"4 July 2012",
	host:"http://www.bbc.co.uk",
	path:"/resources/articles/f1311fc37403ff7518ab0a1b77c69804.xml",
	uploaded_by:"Catherine Tan",
	uploaded_on:"July 17 2012,  12:00 PM PST",
	course:"IAT200",
	week:"4",
	likes:10,
	description:"Check out this article",
	starred:0
}


var article_4 = {
	id:4,
	user:userobject,
	url:"http://www.bbc.co.uk/news/business-18867054",
	title:"HSBC used by 'drug kingpins', says US Senate",
	author:"Paul Adams",
	publishedDate:"4 July 2012",
	host:"http://www.bbc.co.uk",
	path:"/resources/articles/1435b518441f246511d59aac6d66cae5.xml",
	uploaded_by:"Catherine Tan",
	uploaded_on:"July 17 2012,  12:30 PM PST",
	course:"BUS100",
	week:"1",
	likes:7,
	description:"wow cool",
	starred:0
}

var article_5 = {
	id:5,
	user:userobject,
	url:"http://www.forbes.com/sites/victorlipman/2012/06/28/how-to-interview-effectively",
	title:"How To Interview Effectively",
	author:"Victor Lipman",
	publishedDate:"28 June 2012",
	host:"http://www.forbes.com",
	path:"/resources/articles/d41d8cd98f00b204e9800998ecf8427e.xml",
	uploaded_by:"Catherine Tan",
	uploaded_on:"July 15 2012,  12:30 PM PST",
	course:"IAT200",
	week:"2",
	likes:6,
	description:"what?!",
	starred:1

}

userobject.courses = {
	"CMPT120":[article_1, article_2],
	"BUS100":[article_4],
	"IAT200":[article_3, article_5]
};


var articles = [article_1, article_2, article_3, article_4, article_5];


exports.design = function (req, res) {
	if (!req.body.article_url) {
		var error = "";
		if (req.method === 'POST') {
			error = "please enter an URL";
		}

		if (req.session && req.session.user) {

			res.render("engage/design", {
				title:"SFU ENGAGE",
				user:userobject,
				status:"logged in",
				courses:req.session.courses,
				errormsg:error }, function (err, rendered) {


				res.writeHead(200, {'Content-Type':'text/html'});
				res.end(rendered);

			})
		}
		else {
			//to avoid login to testing, this is comment out, using fake user instead
//		res.redirect("/login");
			res.redirect("/demo");

			//login with demo user, remove when everything is set.
		}

		return;
	}


	Parser.articlize(req.body.article_url, function (err) {
		res.render("engage/design", {     
			title:"SFU ENGAGE",
			user:userobject,
			status:"logged in",
			courses:req.session.courses,
			errormsg:error }, function (err, rendered) {

			res.writeHead(200, {'Content-Type':'text/html'});
			res.end(rendered);
		})

	});


}


///////////////////////////////////////////////////////////HEDY'S STUFF ABOVE/////////////////////////////////


exports.shareResource = function (req,res){
	var url = req.body.url;
	var description = req.body.description;
	var course = req.body.course;

	console.log(req.body);

	Parser.articlize(url, function (err,result) {
		var currentWeek = EngageAction.weekHelper();
		Resource.createResource(req.session.user.uuid, {description:description, url:result.url, path:result.path,thumbnail:result.thumbnail, excerpt:result.excerpt, week:currentWeek,course:course,fileType:"html",resourceType:2, title:result.title}, function(err,result){
			if (result){
				EngageAction.resourceHelper(req.session.user, [result], function (error, result) {
					res.writeHead(200, { 'Content-Type':'application/json' });
					res.end(JSON.stringify({ errorcode:0, resource:result[0] }));
				})

			}
			else{
				res.writeHead(200, { 'Content-Type':'application/json' });
				res.end(JSON.stringify({ errorcode:1, message:error }));


			}



		})



	});
}

exports.index = function (req, res) {
	var currentWeek = EngageAction.weekHelper();

	if (req.session && req.session.user) {


		res.render("engage/index", {
			title:"SFU ENGAGE",
			user:req.session.user,
			courses:req.session.courses,
			currentWeek:currentWeek
		}, function (err, rendered) {

			res.writeHead(200, {'Content-Type':'text/html'});
			res.end(rendered);

		})
	}
	else {
		//to avoid login to testing, this is comment out, using fake user instead
//		res.redirect("/login");
		res.redirect("/demo");

		//login with demo user, remove when everything is set.
	}

};


exports.starred = function (req, res) {

	if (req.session && req.session.user) {
		res.render("engage/starred", {     title:"SFU ENGAGE",
			user:req.session.user,
			courses:req.session.courses}, function (err, rendered) {

			res.writeHead(200, {'Content-Type':'text/html'});
			res.end(rendered);

		})
	}
	else {

		res.redirect("/demo");


	}

}

exports.instructor = function (req, res) {

	if (req.session && req.session.user) {
		res.render("engage/instructor", {     title:"SFU ENGAGE",
			user:req.session.user,
			courses:req.session.courses}, function (err, rendered) {


			res.writeHead(200, {'Content-Type':'text/html'});
			res.end(rendered);

		})
	}
	else {
		res.redirect("/demo");

	}

}


exports.profile = function (req, res) {

	if (req.session && req.session.user) {
		res.render("engage/profile", {     title:"SFU ENGAGE",
			user:req.session.user,
			selectedUser:req.params.id,
			courses:req.session.courses}, function (err, rendered) {


			res.writeHead(200, {'Content-Type':'text/html'});
			res.end(rendered);

		})
	}
	else {
		res.redirect("/demo");

	}

}



exports.articleView = function (req, res) {
	comment_1 = {
		msg:"Where is it?",
		user:userobject,
		time:"1 hour ago",
		replies:[]
	}
	comment_2 = {
		msg:"I like this",
		user:userobject,
		time:"5 mins ago",
		replies:[]
	}


	reply_comment_1 = {
		msg:"No idea",
		reply_to:comment_1,
		user:user_1,
		time:"10 mins ago"
	}
	reply_comment_2 = {
		msg:"States?",
		reply_to:comment_1,
		user:user_2,
		time:"5 mins ago"
	}

	reply_comment_3 = {
		msg:"No i dont think so",
		reply_to:comment_1,
		user:user_1,
		time:"5 mins ago"
	}

	reply_comment_4 = {
		msg:"Yah me too",
		reply_to:comment_2,
		user:user_2,
		time:"2 mins ago"
	}

	comment_1.replies = [reply_comment_1, reply_comment_2, reply_comment_3];
	comment_2.replies = [reply_comment_4];


	if (req.session && req.session.user) {

		Resource.getResourceByUUID(req.params.id, function (error, resource) {

			EngageAction.resourceHelper(req.session.user, [resource], function (err,resources) {
				var resource = resources[0];
				var pickedArticle = articles[req.params.id - 1];
				res.render("engage/article", { title:"SFU ENGAGE",
					article:resource,
					comments:[comment_1, comment_2],
					user:req.session.user,
					courses:req.session.courses
				}, function (err, rendered) {


					res.writeHead(200, {'Content-Type':'text/html'});
					res.end(rendered);

				})

			})


		})

	}
	else {
		//to avoid login to testing, this is comment out, using fake user instead
//		res.redirect("/login");
		res.redirect("/demo");

		//login with demo user, remove when everything is set.
	}


}
exports.contributions = function (req, res) {

	if (req.session && req.session.user) {

		res.render("engage/contributions", { title:"SFU ENGAGE",
			user:req.session.user,
			courses:req.session.courses  }, function (err, rendered) {


			res.writeHead(200, {'Content-Type':'text/html'});
			res.end(rendered);

		})
	}
	else {
		res.redirect("/demo");
	}

}
exports.courseView = function (req, res) {
	var currentWeek = EngageAction.weekHelper();
	if (req.session && req.session.user) {
		var courseName = req.params.name;

		var token = courseName.split('-');

		if(token && token.length === 3){
			Course.getCourseByName({subject:token[0],number:token[1],section:token[2]},function(err,result){
				if(result){
					res.render("engage/course", { title:"SFU ENGAGE",
						courseName:courseName,
						user:req.session.user,
						course:result,
						currentWeek:currentWeek,
						courses:req.session.courses
					}, function (err, rendered) {


						res.writeHead(200, {'Content-Type':'text/html'});
						res.end(rendered);

					})
				}
				else{

				}




			});

		}


	}
	else {

		res.redirect("/demo");

	}


}



exports.demoPage = function (req, res) {
//	var fake_user_2 = {uuid:'ted', firstName:"Ted", lastName:"P", userID:"ted", email:"ted@sfu.ca",type:1}
	var fake_user_2 = {uuid:'llt3', firstName:"Catherine", lastName:"Tan", userID:"llt3@sfu.ca", email:"llt3@sfu.ca", type:0, preferedName:"Cath"}

	req.session.user = fake_user_2;
	UserProfile.getUserProfile(req.session.user.uuid, function(err, result) {
		if (err)
			console.log(err)
		req.session.Profile = result;
	});
	//req.session.Profile = fake_user_2_profile;
	User.getUserCourses(req.session.user.uuid, function (err, result) {

		var args= {
			app:1,
			user:"llt3"
		}

		notification.createUserNotificationSettings(args, function(err, success){
			if(success)
				console.log("created: " + success)

			var courseList = ['11', '12'];

			async.forEach(courseList, function(course, done){
				var args = {
					target      : course,
					app         : 2
				}
				notification.setupCourseMaterialNotifiers(args, function(err, callback){
					if(err)
						console.log(err)
					done();
				})
			}, function(err){
				if(err)
					console.log("Problem adding course materials")

				req.session.courses = result;
				res.redirect('/');
			})
		});
	});
}


exports.preference = function (req, res){
	
	if (req.session && req.session.user) {
		ProfileSettings.settings(req, function(result) {

				res.render("engage/preference", 
				{
					title:"SFU ENGAGE",
					user:req.session.user,
					courses:req.session.courses,
					avatar: result.img,
					pref_name: result.pName,
					bio: result.bio,
					format: result.format
					}, function (err, rendered) {
						res.writeHead(200, {'Content-Type':'text/html'});
						res.end(rendered);

				})
		})
		
	}
	else {

		res.redirect("/demo");


	}

}



exports.commentsByResourceUUID = function(request, response) {
	if (request.method === "GET") {
		QueryES.getCommentByResourceUUID(request.params.id, function(err, result) {
			if (!err) {

				if(result){
					EngageAction.commentsHelper(result,function(err,result){
						if (!err){
							response.writeHead(200, { 'Content-Type': 'application/json' });
							response.end(JSON.stringify({ errorcode: 0, comments: result }));
						}
						else{
							response.writeHead(500, { 'Content-Type': 'application/json' });
							response.end(JSON.stringify({ errorcode: 1, message: err }));
						}

					})

				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, comments: "No result found" }));
				}
			} else {
				response.writeHead(500, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: err }));
			}
		});
	}
}

