var http = require('http');
var config = require('./../../config.json');
var queries = require(__dirname + "/../../database/db-queries.js");
var Course = require(__dirname + "/../../models/course.js")
var express = require('express');
var server = require('./../../app-presenter.js');

var currentHost = config.presenterServer.host;
//var currentHost = config.accentServer.host;
var currentPort = config.presenterServer.port;


module.exports = {
	courseTest:{
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
		// get the details of the question created
		getCourse: function(test) {
		
			var newCourse = {
				"title":"Algorithms",
				"section":"D100",
				"subject":"CMPT",
				"number":307,
				"instructor":"BSDF787D98A7SDF8ASD7G"
			}

			Course.createCourse(newCourse, function(error, course){
				if(course){

					var options = {
						host:config.presenterServer.host,
						port:this.port,
						method:"GET",
						path:"/api/course/" + course.uuid,
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
							body.course.title === "Algorithms" &&
							body.course.number === 307);
							test.done();
						});
					});
				}
			});	
		}
	},
}
