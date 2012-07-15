var http    = require('http');
var config  = require('./../../config.json');
var express = require('express');
var server  = require('./../../app-presenter.js');
var queries = require(__dirname + "/../../database/db-queries.js");
var User    = require(__dirname + "/../../models/user.js")

var currentHost = config.presenterServer.host;
var currentPort = config.presenterServer.port;


module.exports = {
	userTest:{
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
							that.server.use(function(req, res, next) {
								req.session = {
									user: user
								}
								next();
							})
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
		queryUsers: function(test){
			this.requestOptions.path = "/api/users/";
			this.requestOptions.port = this.port;
			this.requestOptions.method = "POST";

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.users[0].firstName === "Mike" && 
						body.users[0].userID === "mak10");
					test.done();
				});
			});
			var query = {
				firstName: "Mike",
				lastName: "Klemarewski"
			}
			request.write(JSON.stringify({where: query}));
			request.end();
		},
		/*
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
		},
		

		setPreferedname: function(test){
			this.requestOptions.path = "/api/user/setPreferedname";
			this.requestOptions.port = this.port;
			this.requestOptions.method = "PUT";


			var newName = {
				"name":"Akbar"
			};

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function (chunk) {
					body += chunk;
				}).on('end', function() {
					body = JSON.parse(body);
					console.log(body);
					test.ok(body.errorcode === 0);
					test.done();
				});
			});
			request.write(JSON.stringify(newName));
			request.end();

		}
		*/
	}
}
