var routesCommon = require('./../common/routesCommon.js');
var AccentAction = require("./../../controller/AccentAction.js");
var MediaAction  = require("./../../controller/MediaAction.js");
var TagAction    = require("./../../controller/TagAction.js");
var MediaFile    = require(__dirname + "/../../models/mediafile.js");
var User         = require(__dirname + "/../../models/user");
var Tag          = require(__dirname + "/../../models/tag");
var queryES      = require(__dirname + '/../../controller/queryES.js');
var fs           = require("fs");
var config       = JSON.parse(fs.readFileSync("config.json"));
var util         = require("util");
var child        = require("child_process");

exports.login = function(request, response){
	routesCommon.login(1, request, response);
}

exports.question = function(request, response) {
	routesCommon.questionRoute(1, request, response);
}

exports.questions = function(request, response) {
	routesCommon.questionsRoute(1, request, response);
}

exports.questionsByUser = function(request, response) {	
	routesCommon.questionsByUserRoute(1, request, response);
}

exports.followQuestion = function(request, response) {
	routesCommon.followQuestionRoute(1, request, response);
}

exports.questionStatus = function(request, response) {
	routesCommon.questionStatusRoute(1, request, response);
}



exports.comment = function(request, response) {
	routesCommon.commentRoute(1, request, response);
}

exports.comments = function(request, response) {
	routesCommon.commentsRoute(1, request, response);
}

exports.commentsByUser = function(request, response) {
	routesCommon.commentsByUserRoute(1, request, response);
}

exports.commentVote = function(request, response) {
	routesCommon.commentVoteRoute(1, request, response);
}

exports.commentAnswered = function(request, response) {
	routesCommon.commentAnsweredRoute(1, request, response);
}

exports.commentsByQuestion = function(request, response) {
	routesCommon.commentsByQuestionRoute(1, request, response);
}

exports.search = function(request, response) {
	routesCommon.searchRoute(1, request, response);
}

exports.followQuestion = function(request, response) {
	routesCommon.followQuestionRoute(1, request, response);
}

exports.unfollowQuestion = function(request, response) {
	routesCommon.unfollowQuestionRoute(1, request, response);
}

exports.resourcesInSection = function(request, response){
	routesCommon.resourcesInSection(1, request, response);
}

exports.getConversationsByMedia = function(request, response){
	if(request.method === "GET"){
		if(request.session && request.session.user){
			AccentAction.getConversationByMedia(request.session.user.uuid, request.params.id, function(error, media, user){
				if(!error){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, mediaQuestions: media, userQuestions: user  }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			})
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}
	}
}

// Tag
exports.tag = function(request,response){

	if(request.method === 'POST'){

		if(request.session && request.session.user){
			request.body.user =  request.session.user.uuid;

			TagAction.addTag(request.body, function(error, result){
				if(result){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, tag: result }));
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
	else if (request.method === 'GET'){
		var uuid = request.params.id;
		TagAction.getTagById({'uuid':uuid}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, tag: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
	else if (request.method === 'PUT'){		
		var uuid = request.params.id;
		TagAction.updateTag(uuid, request.body, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, tag: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});	
	}
	else if (request.method === 'DELETE'){
		var uuid = request.params.id;
		TagAction.deleteTag({'uuid':uuid},function(error,result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, tag: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		})
	}


}

exports.lastWatched = function(request, response){
	if(request.session && request.session.user){
		if(request.method === "GET"){
			Tag.getLastWatched(request.session.user.uuid, function(error, tag){
				if(!error){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, tag: tag }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, error: error }));
				}
			});
		}
		else if(request.method === "PUT"){
			Tag.updateLastWatched(request.session.user.uuid, request.body, function(error, tag){
				if(!error){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, tag: tag }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, error: error }));
				}
			})
		}
	}
	else{
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
	}

}

// MediaFile
exports.mediafile = function(request,response){

	if(request.method === 'POST'){
		if(request.session && request.session.user){
			
			console.log("\n\n" + util.inspect(request.files.mediafile) + "\n\n")
			var filepath = request.files.mediafile.path.split('/');
			var filename = filepath[filepath.length - 1];
			var filetype = request.files.mediafile.type;
			
			var mediaFile = {
				user: request.session.user.uuid,
				title: request.body.title,
				description: request.body.description,
				course: request.body.course,
				path: config.accentServer.mediaFolder + filename,
				type: 0
			}
			MediaAction.addMediaFile(mediaFile, function(error, mediaFile){
				if(!error){
					console.log("filepath: " + filepath + " filename: " + filename);
					
					//Convert audio using ffmpeg
					var audioArgs = [
						'-i', request.files.mediafile.path,
						'-threads', '0',
						'-acodec', 'libvo_aacenc',
						'-ac', '128k',
						'-f', 'mp4',
						'media/' + filename
					]

					//Convert video using ffmpeg
					var videoArgs = [
						'-i',
						request.files.mediafile.path,
						'-vcodec', 'libx264',
						'-flags', '+loop',
						'-me_method', 'umh',
						'-g', '250',
						'-qcomp', '0.6',
						'-qmin', '10',
						'-qmax', '51',
						'-qdiff', '4',
						'-bf', '16',
						'-b_strategy', '1', 
						'-i_qfactor', '0.71', 
						'-cmp', '+chroma',
						'-subq', '8',
						'-me_range', '16', 
						'-coder', '1',
						'-sc_threshold', '40', 
						'-keyint_min', '25',
						'-refs', '4',
						'-trellis', '1',
						/*'-partitions', '+parti8x8+parti4x4+partp8x8+partb8x8',*/
						'-s', '720x480',
						'-acodec', 'copy'/*libvo_aacenc*/,
						'-ab', '128k',
						'-threads', '0',
						'-f', 'mp4', 
						'media/' + filename
					]

					if(filetype.match(/audio/)){
						var ffmpeg = child.spawn('ffmpeg', audioArgs);
					}
					else if(filetype.match(/video/)){
						var ffmpeg = child.spawn('ffmpeg', videoArgs);
					}

					ffmpeg.stderr.on('data', function (data) {
					 	console.log('stderr: ' + data);
					});

					ffmpeg.on('exit', function(code){
						console.log("DONE CONVERTING " + code);
					})
					var args = {
						section: request.body.section,
						material: mediaFile.uuid
					}
					require('../../controller/OrganizationAction.js').addResourceToSection(args, function(err, orgResult){
						if(!err){
							response.writeHead(200, { 'Content-Type': 'application/json' });
							response.end(JSON.stringify({ errorcode: 0, mediafile: mediaFile }));
						}
						else{
							response.writeHead(200, { 'Content-Type': 'application/json' });
							response.end(JSON.stringify({ errorcode: 1, message: err }));
						}
					});
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
	else if (request.method === 'GET'){	
		var uuid = request.params.id;
		MediaAction.getMediaFileById({'uuid':uuid}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, mediafile: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
	else if (request.method === 'PUT'){		
		var uuid = request.params.id;
		MediaAction.updateMediaFile({'uuid':uuid}, request.body, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, mediafile: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});	
	}
	else if (request.method === 'DELETE'){
		var uuid = request.params.id;
		MediaAction.deleteMediaFile({'uuid':uuid}, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, mediafile: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});

	}


}

exports.mediafileTag = function(request,response){	
	if (request.method === 'GET'){
		var targetID = request.params.tid;								
		MediaFile.getMediaFileTags(targetID, function(error, result){
			if(result){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, tags: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});		
	}
}

exports.userTagsByMedia = function(request, response){
	if(request.method === "GET"){
		if(request.session && request.session.user){
			MediaFile.getUserTagsByMedia(request.session.user.uuid, request.params.id, function(error, result){
				if(!error){
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 0, tags: result }));
				}
				else{
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify({ errorcode: 1, message: error }));
				}
			})
		}
		else{
			response.writeHead(200, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errorcode: 2, message: 'You aren\'t logged in' }));
		}
	}
}

exports.getQuestionsByMedia = function(request, response){
	if(request.method === "GET"){
		TagAction.getQuestionsByMedia(request.params.id, function(error, result){
			if(!error){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, questions: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		});
	}
}

exports.courseMediaFiles = function(request, response){
	if(request.method === "GET"){
		var courseID = request.params.id;
		MediaAction.getMediaByCourse(courseID, function(error, result){
			if(!error){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 0, media: result }));
			}
			else{
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ errorcode: 1, message: error }));
			}
		})
	}
}

exports.index = function(req, res){
	if (req.session && req.session.user) {
		console.log(JSON.stringify(req.session.user))	
		res.render("accent/index", { 	title: "SFU Accent",
			user :  req.session.user,
			courses : req.session.courses,
			status : "logged in" }, function(err, rendered){			
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(rendered);

		})
		
	}
	else {
		demoUserNotification(function(){ 
			res.redirect("/demo");		
		});
		
	}	
};

exports.demoPage = function (req,res){
	var temp_user = {uuid:"jhc20",firstName:"Jihoon",lastName:"Choi",userID:"jhc20",email:"jhc20@sfu.ca"}

	req.session.user= temp_user;
	User.getUserCourses(req.session.user.uuid,function(err,result){
		req.session.courses = result;
		res.redirect('/');

	});
}

//TODO: remove when everything is setup
var notification = require('../../controller/NotificationAction.js')
var demoUserNotification = function(callback){
	var args= {
		app:1,
		user:"jhc20"
	}
	notification.createUserNotificationSettings(args, function(err, result){
		if(err)
			console.log(err);

		callback();
	});
}

/***NEW ROUTES */
exports.searchQuestionsRoute = function(request, response){
	routesCommon.searchQuestionsRoute(1, request, response);
}


exports.uploadMedia = function (req, res) {
	if (req.session && req.session.user) {

		res.render("accent/upload",
			{ 
				title: "SFU Accent",
				user :  req.session.user,
				courses : req.session.courses,
				status : "logged in" 
			},
			function(err, rendered){			
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(rendered);
			}
		);
	}
};

exports.getUserNotifications = function(request, response){
	routesCommon.getUserNotifications(1, request, response);
}