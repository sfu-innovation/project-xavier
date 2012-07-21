var http    = require('http');
var express = require('express');
var server  = require('./../../app-accent.js');
var config  = require('./../../config.json');
var queries = require(__dirname + "/../../database/db-queries.js");
var User    = require(__dirname + "/../../models/user.js");
var MediaAction  = require(__dirname + "/../../controller/MediaAction.js");

var currentHost = config.accentServer.host;
var currentPort = config.accentServer.port;

var dataFile      = "tests/accent/testing-data.json"
var userID        = "mak10";
var courseID      = "A8G7S6H7ASDFG9";
var mediaFileID   = "1234";
var mediaFileText = "How to make buble tea";
var deletedTagID  = '';

module.exports = {
	courseTest:{
		setUp: function(callback) {
			var that = this;

			this.requestOptions = {
				host:config.accentServer.host,
				headers: {
					"content-type": "application/json"
				}
			}

			queries.dropDB(config.mysqlDatabase["db-name"], function(){
				queries.createDB(config.mysqlDatabase["db-name"], function(){
					queries.insertData(
						dataFile,
						config.mysqlDatabase["db-name"],
						config.mysqlDatabase["user"],
						config.mysqlDatabase["password"],
						config.mysqlDatabase["host"],
						function(){


							User.selectUserByUUID(userID, function(error, user){
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
							})
						});
					});
				});
		},
		tearDown: function(callback){
			this.server.close();
			callback();
		},
		// get the details of the mediaFile created
		getMediaFile: function(test) {
		
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/mediaFile/" + mediaFileID;
		
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
					body.mediafile.title === mediaFileText);
					test.done();
				});
			});
		},
		getCourseMedia: function(test) {
		
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/mediafiles/course/" + courseID;
		
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body);
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						Object.keys(body.media).length === 1);
					test.done();
				});
			});
		},
		// get the details of the mediaFile tag
		getMediaFileTag: function(test) {		
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/mediafile/" + mediaFileID + "/tags";
		
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
		// get tags for a certain mediafile
		getUserTagsByMedia: function(test) {
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/tag/mediafile/" + mediaFileID;
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					console.log(body)
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
					body.tags);
					test.done();
				});
			});
		},
		// update the details of the mediaFile
		updateMediaFile: function(test) {
		
			this.requestOptions.method = "PUT";
			this.requestOptions.path = "/api/mediaFile/" + mediaFileID;
		
			var updatedMediaFile = {
				'title':'torfino kick', 
				'path':'www.torfino.com'
			};

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.mediafile.title === updatedMediaFile.title);
					test.done();
				});
			});
			request.write(JSON.stringify(updatedMediaFile));
			request.end();

		},
		// delete a mediaFile
		deleteMediaFile: function(test) {
			this.requestOptions.method = "DELETE";
			this.requestOptions.path   = "/api/mediaFile/" + mediaFileID + "/";
			
			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					deletedTagID = body.mediafile.uuid;					
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.end();
		}	
	}
}
