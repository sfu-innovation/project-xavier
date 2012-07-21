var http    = require('http');
var express = require('express');
var server  = require('./../../app-accent.js');
var config  = require('./../../config.json');
var queries = require(__dirname + "/../../database/db-queries.js");

var MediaAction  = require(__dirname + "/../../controller/MediaAction.js");

var currentHost = config.accentServer.host;
var currentPort = config.accentServer.port;

var userID       = "A7S7F8GA7SD98A7SDF8ASD7G";
var courseID     = "A8G7S6H7ASDFG9";
var deletedTagID = '';

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
					
					var newMediaFile = {
						user: userID,				
						title:"How to make buble tea",
						course: courseID,
						path:"http://www.youtube.com/bt",
						type:1
					}
					MediaAction.addMediaFile(newMediaFile, function(error, mediaFile){

						if(mediaFile){
							that.mediaFile = mediaFile;
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
		// get the details of the mediaFile created
		getMediaFile: function(test) {
		
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/mediaFile/" + this.mediaFile.uuid;
		
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
					body.mediafile.title === "How to make buble tea");
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
			this.requestOptions.path = "/api/mediafile/" + this.mediaFile.uuid + "/tags";
		
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
		// update the details of the mediaFile
		updateMediaFile: function(test) {
		
			this.requestOptions.method = "PUT";
			this.requestOptions.path = "/api/mediaFile/" + this.mediaFile.uuid;
		
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
			this.requestOptions.path   = "/api/mediaFile/" + this.mediaFile.uuid + "/";
			
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
		},
		// double check to ensure mediaFile's deletion
		getDeletedMediaFile: function(test) {
		
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/mediaFile/" + deletedTagID;
		
			var request = http.get(this.requestOptions, function(response){
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
	}
}
