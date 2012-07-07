var http = require('http');
var config = require('./../../config.json');
var question = require('./../../models/question.js');
var comment = require('./../../models/comment.js');

var AppTypes = { Accent: 0, Presenter: 1 };
var Direction = { Down: 0, Up: 1 };

// question variables
var questionUid = "SomeUid";
var userUid = "SomeUserUid";
var questionTitle = "SomeTitle";
var questionBody = "SomeQuestion";
var updatedQuestionBody = "SomeUpdatedQuestion";

exports.questionTest = {
	// create a question for some user
	createQuestion: function(test) {
		var newQuestion = new question(questionUid, userUid, questionTitle, questionBody, 'life', 0);
		
		var options = {
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"POST",
			path:"/user/jrf2/" + AppTypes.Presenter + "/questions",
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
	
	// get the details of the question created
	getQuestion: function(test) {	
		var options = {
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"GET",
			path:"/question/" + AppTypes.Presenter + "/" +  questionUid,
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
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"PUT",
			path:"/question/" + AppTypes.Presenter + "/" +  questionUid,
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
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"GET",
			path:"/question/" + AppTypes.Presenter + "/" +  questionUid,
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
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"DELETE",
			path:"/question/" + AppTypes.Presenter + "/" +  questionUid,
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
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"GET",
			path:"/question/" + AppTypes.Presenter + "/" +  questionUid,
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
};

exports.commentTest = {
	// create a question for some user
	createQuestion: function(test) {
		var newQuestion = new question(questionUid, userUid, questionTitle, questionBody, 'life', 0);
		
		var options = {
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"POST",
			path:"/user/jrf2/" + AppTypes.Presenter + "/comments",
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
		request.write(JSON.stringify({ comment: newQuestion }));
		request.end();
	},
	
	// get the details of the question created
	getQuestion: function(test) {	
		var options = {
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"GET",
			path:"/comment/" + AppTypes.Presenter + "/" +  questionUid,
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
	
	// update the question
	updateQuestion: function(test) {
		var options = {
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"PUT",
			path:"/comment/" + AppTypes.Presenter + "/" +  questionUid,
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
	
	// check that the question has been updated
	checkUpdatedQuestion: function(test) {
		var options = {
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"GET",
			path:"/comment/" + AppTypes.Presenter + "/" +  questionUid,
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
	
	// delete the question
	deleteQuestion: function(test) {
		var options = {
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"DELETE",
			path:"/comment/" + AppTypes.Presenter + "/" +  questionUid,
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
			host:config.presenterServer.host,
			port:config.presenterServer.port,
			method:"GET",
			path:"/comment/" + AppTypes.Presenter + "/" +  questionUid,
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
};