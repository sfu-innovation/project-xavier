var http    = require('http');
var express = require('express');
var server  = require('./../../app-accent.js');
var config  = require('./../../config.json');
var queries = require(__dirname + "/../../database/db-queries.js");

var TagAction  = require(__dirname + "/../../controller/TagAction.js");

var currentHost = config.accentServer.host;
var currentPort = config.accentServer.port;

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
					
					var newTag = {
						user:"BSDF787D98A7SDF8ASD7G2",
						start:12,
						end:34,			
						type:2,
						target:"abc1235",
						title:"mario kart",
						description:"luigi",
						question:"aJfznhseQuOicWWAjx7F00",
						important:false,
						interest:false,
						examable:true,
						reviewlater:true,
						shared:false
					}
					TagAction.addTag(newTag, function(error, tag){

						if(tag){
							that.tag = tag;
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
		// get the details of the tag created
		getTag: function(test) {
		
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/tag/" + this.tag.uuid;
		
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
					body.tag.title === "mario kart" &&
					body.tag.description === 'luigi');
					test.done();
				});
			});
		},
		// update the details of the tag
		updateTag: function(test) {
		
			this.requestOptions.method = "PUT";
			this.requestOptions.path = "/api/tag/" + this.tag.uuid;
		
			var updatedTag = {
				'title':'samba dance', 
				'shared':true
			};

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					console.log("sexy body:");
					console.log(body);
					test.ok(body.errorcode === 0 &&
						body.tag.title === updatedTag.title);
					test.done();
				});
			});
			request.write(JSON.stringify(updatedTag));
			request.end();

		},
		// delete a tag
		deleteTag: function(test) {
			this.requestOptions.method = "DELETE";
			this.requestOptions.path   = "/api/tag/" + this.tag.uuid + "/";
			
			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					deletedTagID = body.tag.uuid;
					console.log("deleted tag id = " + deletedTagID);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.end();
		},
		// double check to ensure tag's deletion
		getDeletedTag: function(test) {
		
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/tag/" + deletedTagID;
		
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
