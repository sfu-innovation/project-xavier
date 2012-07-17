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
	/*commentTest:{

		setUp: function(callback) {
			var self = this;
			this.server = express.createServer();
			this.server.use(server)
			this.server.listen(function() {
				self.port = this.address().port;
				callback();
			});
		},
		
		tearDown: function(callback){
			this.server.close();
			callback();
		},
		
		// creates the question we will comment on
		createQuestion: function(test) {
			var newQuestion = new question(questionUid, userUid, questionTitle, questionBody, 'life', 0);
				
			var options = {
				host:this.host,
				port:this.port,
				method:"POST",
				path:"/api/user/jrf2/questions",
				headers: {
					"content-type": "application/json"
				}
			}
			
			var request = http.request(options, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.write(JSON.stringify({ question: newQuestion }));
			request.end();
		},
		
		// create a comment for some user
		createComment: function(test) {
			var newComment = new comment(questionUid, userUid, 1, commentTitle, commentBody);
			
			var options = {
				host:this.host,
				port:this.port,
				method:"POST",
				path:"/api/user/jrf2/comments",
				headers: {
					"content-type": "application/json"
				}
			}
			
			var request = http.request(options, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.write(JSON.stringify({ comment: newComment }));
			request.end();
		},
		
		// get the details of the comment created
		getComment: function(test) {	
			var options = {
				host:this.host,
				port:this.port,
				method:"GET",
				path:"/api/comment/" +  questionUid,
				headers: {
					"content-type": "application/json"
				}
			}
		
			var request = http.get(options, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.comment.user === userUid &&
						body.comment.body === questionBody);
					test.done();
				});
			});
		},
		
		// update the comment
		updateComment: function(test) {
			var options = {
				host:this.host,
				port:this.port,
				method:"PUT",
				path:"/api/comment/" +  questionUid,
				headers: {
					"content-type": "application/json"
				}
			}
			
			var request = http.request(options, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.write(JSON.stringify({ commentBody: updatedQuestionBody }));
			request.end();
		},
		
		// check that the comment has been updated
		checkUpdatedComment: function(test) {
			var options = {
				host:this.host,
				port:this.port,
				method:"GET",
				path:"/api/comment/" +  questionUid,
				headers: {
					"content-type": "application/json"
				}
			}
		
			var request = http.get(options, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.comment.user === userUid &&
						body.comment.body === updatedQuestionBody);
					test.done();
				});
			});
		},
		
		// delete the comment
		deleteComment: function(test) {
			var options = {
				host:this.host,
				port:this.port,
				method:"DELETE",
				path:"/api/comment/" +  questionUid,
				headers: {
					"content-type": "application/json"
				}
			}
			
			var request = http.request(options, function(response){
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
		
		// try to get the deleted comment to make sure it has been deleted
		getDeletedComment: function(test) {
			var options = {
				host:this.host,
				port:this.port,
				method:"GET",
				path:"/api/comment/" +  questionUid,
				headers: {
					"content-type": "application/json"
				}
			}
		
			var request = http.get(options, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 1);
					test.done();
				});
			});
		}
	}*/
}