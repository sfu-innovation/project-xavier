var http    = require('http');
var express = require('express');
var server  = require('./../../app-accent.js');
var config  = require('./../../config.json');
var queries = require(__dirname + "/../../database/db-queries.js");
var User    = require(__dirname + "/../../models/user.js");
var Tag     = require(__dirname + "/../../models/tag.js");
var TagAction  = require(__dirname + "/../../controller/TagAction.js");

var currentHost = config.accentServer.host;
var currentPort = config.accentServer.port;

var dataFile      = "tests/accent/testing-data.json"
var userID        = "mak10";
var testTagUUID   = "bbc1";
var mediaID       = "1234";
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
		// get the details of the tag created
		'get tag': function(test) {
		
			this.requestOptions.method = "GET";
			this.requestOptions.path = "/api/tag/" + testTagUUID;
		
			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 && body.tag);
					test.done();
				});
			});
		},
		// update the details of the tag
		'update tag': function(test) {
		
			this.requestOptions.method = "PUT";
			this.requestOptions.path = "/api/tag/" + testTagUUID;
		
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
					test.ok(body.errorcode === 0 &&
						body.tag.title === updatedTag.title);
					test.done();
				});
			});
			request.write(JSON.stringify(updatedTag));
			request.end();

		},
		// delete a tag
		'delete tag': function(test) {
			this.requestOptions.method = "DELETE";
			this.requestOptions.path   = "/api/tag/" + testTagUUID + "/";
			
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
		// Gets users last watched tag
		'get last watched tag': function(test){

			this.requestOptions.method = "GET";
			this.requestOptions.path     = "/api/tag/last-watched";

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.tag.user === userID);
					test.done();
				});
			});
		},
		// Updates the users last watched media tag
		'update last watched tag': function(test){
			this.requestOptions.method = "PUT";
			this.requestOptions.path     = "/api/tag/last-watched";

			var updates = {
				'start':10,
				'target':'1234'
			};

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.tag.user === userID &&
						body.tag.start === updates.start);
					test.done();
				});
			});

			request.write(JSON.stringify(updates));
			request.end();
		}	
	}
}
