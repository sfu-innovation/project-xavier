var http    = require('http');
var config  = require('./../../config.json');
var express = require('express');
var server  = require('./../../app-presenter.js');
var queries = require(__dirname + "/../../database/db-queries.js");
var User    = require(__dirname + "/../../models/user.js");
var Course  = require(__dirname + "/../../models/course.js");
var CourseMember = require(__dirname + "/../../models/courseMember.js");

var currentHost = config.presenterServer.host;
var currentPort = config.presenterServer.port;


module.exports = {
	userTest:{
		setUp: function(callback) {
		

			var that = this;

			this.requestOptions = {
				host:config.presenterServer.host,
				headers: {
					"content-type": "application/json"
				}
			}

			queries.dropDB(config.mysqlDatabase["db-name"], function(){
				queries.createDB(config.mysqlDatabase["db-name"], function(){
					
					var newUser = {
						"firstName":"Mike",
						"lastName":"Klemarewski",
						"type":1,
						"userID":"mak10",
						"email":"mak10@sfu.ca"
					}

					User.createUser(newUser, function(error, user){
						if(user){
							that.user = user;
							that.server = express.createServer();
							that.server.use(function(req, res, next) {
								req.session = {
									user: user
								}
								next();
							})
							that.server.use(server);
							that.server.listen(function() {
								that.requestOptions.port = this.address().port;
								callback();
							});
						}
						else{
							callback();
						}
					});

				});
			});
		},
		tearDown: function(callback){
			this.server.close();
			callback();
		},
		
		getUser: function(test){

			this.requestOptions.path = "/api/user/" + this.user.uuid;
			this.requestOptions.method = "GET";

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.user.firstName === "Mike" && 
						body.user.userID === "mak10");
					test.done();
				});
			});
		},
		queryUsers: function(test){
			this.requestOptions.path = "/api/users/";
			this.requestOptions.method = "POST";

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.users[0].firstName === "Mike" && 
						body.users[0].userID === "mak10");
					test.done();
				});
			});
			var query = {
				firstName: "Mike",
				lastName: "Klemarewski"
			}
			request.write(JSON.stringify({where: query}));
			request.end();
		},
		
		getUserProfile: function(test){

			var that = this;

			this.requestOptions.path = "/api/user/" + this.user.uuid + "/profile";
			this.requestOptions.method = "GET";

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.profile.user === that.user.uuid);
					test.done();
				});
			});
		},
		setPreferedName: function(test){
			this.requestOptions.path = "/api/user/setPreferedname";
			this.requestOptions.method = "PUT";


			var newName = {
				"name":"Akbar"
			};

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.user.preferedName === newName.name);
					test.done();
				});
			});
			request.write(JSON.stringify(newName));
			request.end();

		},
		getUserCourses: function(test){
			
			var that = this;
			var newCourse = {
				"title":"Algorithms",
				"section":"D100",
				"subject":"CMPT",
				"number":307,
				"instructor":"BSDF787D98A7SDF8ASD7G"
			}

			// Add student to newly created course, then check to see if the student is 
			// a member of that course
			Course.createCourse(newCourse, function(error, course){

				if(course){
					CourseMember.addCourseMember(that.user.uuid, course.uuid, function(error, result){
						if(result){
							that.requestOptions.method = "GET";
							that.requestOptions.path = "/api/user/courses";

							var request = http.get(that.requestOptions, function(response){
								var body = "";
								response.on('data', function (chunk){
									body += chunk;
								}).on('end', function(){
									body = JSON.parse(body);
									test.ok(body.errorcode === 0 && 
										Object.keys(body.courses).length === 1 &&
										body.courses[0].title === "Algorithms");
									test.done();
								});
							});
						}
						else{
							test.ok(false);
							test.done();
						}
					})
				}
				else{
					test.ok(false);
					test.done();
				}
			});
		}
	}
}
