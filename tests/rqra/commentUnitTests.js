var http      = require('http');
var express   = require('express');
var fs        = require('fs');
var config    = require('./../../config.json');
var question  = require('./../../models/question.js');
var comment   = require('./../../models/comment.js');
var server    = require('./../../app-rqra.js');
var esQuery   = require(__dirname + '/../../database/es-query');
var queries   = require(__dirname + '/../../database/db-queries');
var direction = { down: 0, up: 1 };
var dataFile  = 'tests/rqra/testing-data.json';
var testData  = JSON.parse(fs.readFileSync(dataFile));

// question variables
var questionUUID = "pJfzndwdadddQuOicWWAjx7F07";

var commentUUID  = "qJfzggggguOicWWAjx7F21";
var commentTitle = "Here's my number";
var commentBody  = "call me maybe?";
var userID       = "mcs3";


module.exports = {

	commentTest:{
		setUp: function(callback) {
			var that = this;
			this.requestOptions = {
				host:config.engageServer.host,
				headers: {
					"content-type": "application/json"
				}
			}
			esQuery('tests/rqra/es-test-data.json', function(result){

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
		
		// create a comment for some user
		"create comment": function(test) {
			
			var newComment = {
				target_uuid: questionUUID,
				objectType: 1,
				title: commentTitle,
				body: commentBody
			}
			
			this.requestOptions.method = "POST";
			this.requestOptions.path   = "/api/comment";


			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.comment);
					test.done();
				});
			});
			request.write(JSON.stringify({ comment: newComment }));
			request.end();
		},
		
		// get the details of a comment
		"get comment": function(test) {
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/comment/" + commentUUID;
		
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.comment.body &&
						body.comment.user);
					test.done();
				});
			});
		},
		"get all comments": function(test){
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/comments/0";

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		"get comments by user": function(test){
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/user/" + userID + "/comments/0";
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		"get comments by question": function(test){
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/question/" + questionUUID + "/comments/0";
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
		},
		// update a comment
		"update comment": function(test) {
			this.requestOptions.method = "PUT";
			this.requestOptions.path   = "/api/comment/" + commentUUID;

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
			request.write(JSON.stringify({ commentBody: commentBody }));
			request.end();
		},
		// delete a comment
		"delete comment": function(test) {
			this.requestOptions.method = "DELETE";
			this.requestOptions.path   = "/api/comment/" + commentUUID;
			
			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.result._id === commentUUID);
					test.done();
				});
			});
			request.end();
		},
		"upvote comment": function(test){
			this.requestOptions.method = "PUT";
			this.requestOptions.path   = "/api/comment/" + commentUUID + "/vote/" + direction.up;

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				})
			}).end();
		},
		"downvote comment": function(test){
			this.requestOptions.method = "PUT";
			this.requestOptions.path   = "/api/comment/" + commentUUID + "/vote/" + direction.down;

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0);
					test.done();
				})
			}).end();
		},
	}
}