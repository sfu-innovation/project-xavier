var http = require('http');
var config = require('./../../config.json');

var express = require('express');
var server = require('./../../app-presenter.js');

var currentHost = config.presenterServer.host;
//var currentHost = config.accentServer.host;
var currentPort = config.presenterServer.port;


module.exports = {
	userTest:{	
		// get the details of the question created
		
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
		
		getUser: function(test) {
			var user_id = "A7S7F8GA7SD98A7SDF8ASD7G";
		
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
	},

	courseTest:{
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
		// get the details of the question created
		getCourse: function(test) {
			var course_id = "A827346H7ASDFG9";
		
			var options = {
				host:config.presenterServer.host,
				port:this.port,
				method:"GET",
				path:"/api/course/" + course_id,
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
					body.course.title === "Networking" &&
					body.course.number === 371);
					test.done();
				});
			});
		}
	},
}