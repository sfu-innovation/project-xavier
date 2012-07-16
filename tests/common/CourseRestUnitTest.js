var http    = require('http');
var express = require('express');
var server  = require('./../../app-rqra.js');
var config  = require('./../../config.json');
var queries = require(__dirname + "/../../database/db-queries.js");
var Course  = require(__dirname + "/../../models/course.js");
var User    = require(__dirname + "/../../models/user.js");
var CourseMember = require(__dirname + "/../../models/courseMember.js");

var currentHost = config.presenterServer.host;
var currentPort = config.presenterServer.port;


module.exports = {
	courseTest:{
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
					
					var newCourse = {
						"title":"Algorithms",
						"section":"D100",
						"subject":"CMPT",
						"number":307,
						"instructor":"BSDF787D98A7SDF8ASD7G"
					}
					Course.createCourse(newCourse, function(error, course){

						if(course){
							that.course = course;
							that.server = express.createServer();

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
		// get the details of the question created
		getCourse: function(test) {
		
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/course/" + this.course.uuid;
		
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
					body.course.title === "Algorithms" &&
					body.course.number === 307);
					test.done();
				});
			});
		},
		courseQuery: function(test){

			this.requestOptions.method = "POST";
			this.requestOptions.path   = "/api/courses/";

			var that = this;

			var newCourse = {
						"title":"Graphics",
						"section":"D300",
						"subject":"CMPT",
						"number":361,
						"instructor":"BSDF787D981234AVD34"
					}
			Course.createCourse(newCourse, function(error, course){
				if(course){
					var request = http.request(that.requestOptions, function(response){
						var body = "";
						response.on('data', function (chunk) {
							body += chunk;
						}).on('end', function() {
							body = JSON.parse(body);
							test.ok(body.errorcode === 0 &&
								body.courses[0].title === "Graphics" && 
								body.courses[0].number === 361);
							test.done();
						});
					});

					var query = {
						subject:"CMPT",
						number: 361
					}

					request.write(JSON.stringify({where:query}));
					request.end();
				}
				else{
					test.ok(false);
					test.done();
				}
			});
		},
		courseMembers: function(test){
			
			var that = this;
			var newUser = {
				"firstName":"Mike",
				"lastName":"Klemarewski",
				"type":0,
				"userID":"mak10",
				"email":"mak10@sfu.ca"
			}

			User.createUser(newUser, function(error, user){
				if(user){
					CourseMember.addCourseMember(user.uuid, that.course.uuid, function(error, result){
						if(error){
							test.ok(false);
							test.done();
						}
						else{
							that.requestOptions.method = "GET";
							that.requestOptions.path   = "/api/course/" + that.course.uuid + "/members";

							var request = http.get(that.requestOptions, function(response){
								var body = "";
								response.on('data', function (chunk) {
									body += chunk;
								}).on('end', function() {
									body = JSON.parse(body);
									test.ok(body.errorcode === 0 && body.members[0].uuid === user.uuid);
									test.done();
								});
							});
						}
					})
				}
				else{
					test.ok(false);
					test.done();
				}
			});
		},
		courseInstructor: function(test){
			var that = this;
			var newUser = {
				"firstName":"Bill",
				"lastName":"Nye",
				"type":1,
				"userID":"bnye",
				"email":"bnye@sfu.ca"
			}

			// Create a professor, assign them to a new course
			// Check to see if the professor is properly assigned to the course
			User.createUser(newUser, function(error, user){
				if(user){
					var newCourse = {
						"title":"Graphics",
						"section":"D300",
						"subject":"CMPT",
						"number":361,
						"instructor":user.uuid
					}
					Course.createCourse(newCourse, function(error, course){
						if(course){
							that.requestOptions.method = "GET";
							that.requestOptions.path = "/api/course/" + course.uuid + "/instructor";
							var request = http.get(that.requestOptions, function(response){
								var body = "";
								response.on('data', function (chunk){
									body += chunk;
								}).on('end', function(){
									body = JSON.parse(body);
									test.ok(body.errorcode === 0 && body.instructor.uuid === user.uuid);
									test.done();
								});
							});
						}
						else{
							test.ok(false);
							test.done();
						}
					});
				}
				else{
					test.ok(false);
					test.done();
				}
			});
		}
	}
}
