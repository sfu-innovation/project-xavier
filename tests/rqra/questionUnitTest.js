var http      = require('http');
var express   = require('express');
var fs        = require('fs');
var config    = require('./../../config.json');
var question  = require('./../../models/question.js');
var server    = require('./../../app-rqra.js');
var queries   = require(__dirname + '/../../database/db-queries');
var esInsert  = require(__dirname + '/../../database/es-query');
var QueryES   = require(__dirname + '/../../controller/queryES.js');
var Direction = { Down: 0, Up: 1 };
var dataFile  = 'tests/rqra/testing-data.json';
var testData  = JSON.parse(fs.readFileSync(dataFile));

// question variables
var questionID    = "pJfzndwdadddQuOicWWAjx7F07";
var questionTitle = "Test question Title";
var questionBody  = "Do radioactive cats have 18 half-lives?"
var userID        = "jbo1";
var appType       = 0;
var section   = "someSection";

module.exports = {

	questionTests:{
		setUp: function(callback) {
			var that = this;
			this.requestOptions = {
				host:config.engageServer.host,
				headers: {
					"content-type": "application/json"
				}
			}
			esInsert('tests/rqra/es-test-data.json', function(result){
				queries.dropDB(config.mysqlDatabase['db-name'], function(){
					queries.createDB(config.mysqlDatabase["db-name"], function(){

						queries.insertData(
							dataFile,
							config.mysqlDatabase["db-name"],
							config.mysqlDatabase["user"],
							config.mysqlDatabase["password"],
							config.mysqlDatabase["host"],
							function(){
								that.user     = testData.users[0];
								that.server   = express.createServer();
								that.server.use(function(req, res, next) {
									req.session = {
										user: that.user
									}
									next();
								})
								that.server.use(server);
								that.server.listen(function() {
									that.requestOptions.port = this.address().port;
									callback();
								});
							}
						);
					});
				});
			});
		},
		tearDown: function(callback){
			this.server.close();
			callback();
		},

		// create a question for some user
		"create question": function(test) {
			var newQuestion = {
				title: questionTitle,
				body: questionBody,
				category: 'life',
				sectionUuid: section
			}
			
			this.requestOptions.method = "POST";
			this.requestOptions.path   = "/api/question";

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.write(JSON.stringify({ question: newQuestion }));
			request.end();
		},
		// get the details of the question created
		"get question": function(test) {	
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/question/" + questionID;

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		"get all questions": function(test){
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/questions/page/" + 0;

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		// update the question
		"update question": function(test) {
			this.requestOptions.method = "PUT";
			this.requestOptions.path   = "/api/question/" + questionID;

			var newTitle = "New question title";
			var newBody = "Girl look at that body";
			
			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.question._id === questionID);
					test.done();
				});
			});
			request.write(JSON.stringify({ title: newTitle, body: newBody}));
			request.end();
		},
		
		// delete a question
		"delete question": function(test) {
			this.requestOptions.method = "DELETE";
			this.requestOptions.path   = "/api/question/" + questionID;
			
			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.end();
		},
		"unanswered questions": function(test){
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/questions/unanswered/page/0";

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		"answered questions": function(test){
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/questions/answered/page/" + 0;

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		"new questions": function(test){
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/questions/new/page/" + 0;

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		"instructor questions": function(test){
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/questions/instructor/page/" + 0;

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		"questions by user": function(test){
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/user/" + userID + "/questions/page/0";

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		"follow question": function(test){
			this.requestOptions.method = "PUT";
			this.requestOptions.path = "/api/question/" + questionID + "/follow";
			
			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.question._id === questionID);
					test.done();
				});
			}).end();
		},
		"unfollow question": function(test){
			var that = this;
			QueryES.addFollower(questionID, this.user.uuid, appType, function(err, result) {
				if(result){
					that.requestOptions.method = "PUT";
					that.requestOptions.path = "/api/question/" + questionID + "/unfollow";
					var request = http.request(that.requestOptions, function(response){
						var body = "";
						response.on('data', function (chunk) {
							body += chunk;
						}).on('end', function() {
							body = JSON.parse(body);
							test.ok(body.errorcode === 0 &&
								body.question._id === questionID);
							test.done();
						});
					}).end();
				}
				else{
					test.ok(false);
					test.done();
				}
			});
		},
		"update question status": function(test){
			this.requestOptions.method = "PUT";
			this.requestOptions.path   = "/api/question/" + questionID + "/status";

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.question._id === questionID);
					test.done();
				});
			}).end();
		}
	}
}
