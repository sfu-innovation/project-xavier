var http = require('http');
//var config = require('./../../config.json');
var question = require('./../../models/question.js');
var comment = require('./../../models/comment.js');
var express = require('express');
var server = require('./../../app-presenter.js');
var Direction = { Down: 0, Up: 1 };

// question variables
var questionUid = "SomeUid";
var userUid = "SomeUserUid";
var questionTitle = "SomeTitle";
var questionBody = "SomeQuestion";
var updatedQuestionBody = "SomeUpdatedQuestion";
var commentTitle = "SomeCommentTitle";
var commentBody = "SomeCommentBody";

module.exports = {

	questionTests:{
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

		// create a question for some user
		createQuestion: function(test) {
			var newQuestion = new question(userUid, questionTitle, questionBody, 'life');
				
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
					questionUid = body.question._id;
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.write(JSON.stringify({ question: newQuestion }));
			request.end();
		},
		
		// get the details of the question created
		getQuestion: function(test) {	
			var options = {
				host:this.host,
				port:this.port,
				method:"GET",
				path:"/api/question/" +  questionUid,
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
						body.question.user === userUid &&
						body.question.body === questionBody);
					test.done();
				});
			});
		},
		
		// update the question
		updateQuestion: function(test) {
			var options = {
				host:this.host,
				port:this.port,
				method:"PUT",
				path:"/api/question/" +  questionUid,
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
			request.write(JSON.stringify({ questionBody: updatedQuestionBody }));
			request.end();
		},
		
		// check that the question has been updated
		checkUpdatedQuestion: function(test) {
			var options = {
				host:this.host,
				port:this.port,
				method:"GET",
				path:"/api/question/" +  questionUid,
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
						body.question.user === userUid &&
						body.question.title === updatedQuestionBody);
					test.done();
				});
			});
		},
		
		// delete the question
		deleteQuestion: function(test) {
			var options = {
				host:this.host,
				port:this.port,
				method:"DELETE",
				path:"/api/question/" +  questionUid,
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
		
		// try to get the deleted question to make sure it has been deleted
		getDeletedQuestion: function(test) {
			var options = {
				host:this.host,
				port:this.port,
				method:"GET",
				path:"/api/question/" +  questionUid,
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
