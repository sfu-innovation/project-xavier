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
			queries.createDB(config.mysqlDatabase["db-name"], function(){
				console.log("created database");
				var self = this;
				this.server = express.createServer();
				this.server.use(server)
				this.server.listen(function() {
					self.port = this.address().port;
					callback();
				});
			});
		},
		tearDown: function(callback){
			queries.dropDB(config.mysqlDatabase["db-name"], function(){
				this.server.close();
				callback();
			});
		},
		
		getUser: function(test){
		
			var newUser = {
				"firstName":"Mike",
				"lastName":"Klemarewski",
				"type":1,
				"userID":"mak10",
				"email":"mak10@sfu.ca"
			}

			User.createUser(newUser, function(error, user){
				console.log("created user");
				if(user){
					var user_id = user.uuid;
					var options = {
						host:config.presenterServer.host,
						port:this.port,
						method:"GET",
						path:"/api/user/" + user_id,
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
								body.user.firstName === "Mike" && 
								body.user.userID === "mak10");
							test.done();
						});
					});
				}
				else{
					test.ok(false);
					test.done();
				}
			})

			
		}
	},

}
