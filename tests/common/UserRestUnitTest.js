var http = require('http');
var config = require('./../../config.json');
var queries = require(__dirname + "/../../database/db-queries.js");
var User = require(__dirname + "/../../models/user.js")
var express = require('express');
var server = require('./../../app-presenter.js');

var currentHost = config.presenterServer.host;
//var currentHost = config.accentServer.host;
var currentPort = config.presenterServer.port;


module.exports = {
	userTest:{	
		// get the details of the question created
		
		setUp: function(callback) {
		

			var that = this;

			this.requestOptions = {
				host:config.presenterServer.host,
				headers: {
					"content-type": "application/json"
				}
			}

			queries.dropDB(config.mysqlDatabase["db-name"], function(){
				queries.createDB(config.mysqlDatabase["db-name"], function(){
					
					var newUser = {
						"firstName":"Mike",
						"lastName":"Klemarewski",
						"type":1,
						"userID":"mak10",
						"email":"mak10@sfu.ca"
					}

					User.createUser(newUser, function(error, user){
						if(user){
							that.user = user;
							that.server = express.createServer();
							that.server.use(server);
							that.server.listen(function() {
								that.port = this.address().port;
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
		
		getUser: function(test){

			this.requestOptions.path = "/api/user/" + this.user.uuid;
			this.requestOptions.port = this.port;
			this.requestOptions.method = "GET";

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.user.firstName === "Mike" && 
						body.user.userID === "mak10");
					test.done();
				});
			});
		},
		getUserProfile: function(test){

			var that = this;

			this.requestOptions.path = "/api/user/" + this.user.uuid + "/profile";
			this.requestOptions.port = this.port;
			this.requestOptions.method = "GET";

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.profile.user === that.user.uuid);
					test.done();
				});
			});
		}
	}

}
