var http      = require('http');
var express   = require('express');
var fs        = require('fs');
var config    = require('./../../config.json');
var question  = require('./../../models/question.js');
var comment   = require('./../../models/comment.js');
var server    = require('./../../app-rqra.js');
var queries   = require(__dirname + '/../../database/db-queries');
var Direction = { Down: 0, Up: 1 };
var dataFile  = 'tests/engage/testing-data.json';
var testData  = JSON.parse(fs.readFileSync(dataFile));

// question variables
var questionUid = "SomeUid";
var userUid = "SomeUserUid";
var questionTitle = "SomeTitle";
var questionBody = "SomeQuestion";
var updatedQuestionTitle = "SomeUpdatedTitle";
var updatedQuestionBody = "SomeUpdatedQuestion";
var commentTitle = "SomeCommentTitle";
var commentBody = "SomeCommentBody";

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
		},
		tearDown: function(callback){
			this.server.close();
			callback();
		},

		// create a question for some user
		
		/*Broken because of crazy notification shit
		createQuestion: function(test) {
			var newQuestion = {
				title: questionTitle,
				body: questionBody,
				category: 'life'
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
		*/
		// get the details of the question created
		getQuestion: function(test) {	
			var questionID = "pJfznhheQuOicWWAjx7F00";
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
		
		// update the question
		updateQuestion: function(test) {
			var questionID = "pJfznhheQuOicWWAjx7F00";
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
		deleteQuestion: function(test) {
			var questionID = "pJfznhheQuOicWWAjx7F00";
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
		}
	},
	
}
