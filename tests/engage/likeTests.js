var http     = require('http');
var express  = require('express');
var fs       = require('fs');
var server   = require(__dirname + '/../../app-engage.js');
var config   = require(__dirname + '/../../config.json');
var queries  = require(__dirname + '/../../database/db-queries');
var Resource = require(__dirname + '/../../models/resource');
var User     = require(__dirname + '/../../models/user');
var Like     = require(__dirname + '/../../models/like');
var dataFile = 'tests/engage/testing-data.json';
var testData = JSON.parse(fs.readFileSync(dataFile));

module.exports = {
	likeTests:{
		setUp: function(callback){
			var that = this;
			this.requestOptions = {
				host:config.engageServer.host,
				headers: {
					"content-type": "application/json"
				}
			}

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
							that.resource = testData.resources[0];
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
		},
		tearDown: function(callback){
			this.server.close();
			callback();
		},
		// Like a resource and test that the number of likes is increased
		likeResource: function(test){
			var that = this;
			this.requestOptions.method = "POST";
			this.requestOptions.path   = "/api/resource/"+this.resource.uuid+"/like";

			var request = http.request(this.requestOptions, function(response){
				var body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.resource.uuid === that.resource.uuid &&
						body.resource.likes === that.resource.likes + 1);
					test.done();
				});
			});

			request.end();
		},
		// First like a resource, then unlike it and test the result
		unlikeResource: function(test){
			var that = this;

			Like.likeResource(this.user.uuid, this.resource.uuid, function(error, result){

				that.requestOptions.method = "DELETE";
				that.requestOptions.path   = "/api/resource/"+that.resource.uuid+"/like";
				
				var request = http.request(that.requestOptions, function(response){
					var body = "";
					response.on('data', function(chunk){
						body += chunk;
					}).on('end', function(){
						body = JSON.parse(body);
						test.ok(body.errorcode === 0 &&
							body.resource.uuid === that.resource.uuid &&
							body.resource.likes === that.resource.likes);
						test.done();
					});
				});

				request.end();
			});
		},
		// Makes sure REST method getLikes returns the right values in the response
		getLikes: function(test){
			var that = this;
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/resource/" + this.resource.uuid + "/likes";

			var request = http.get(this.requestOptions, function(response){
				var body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 && body.likes === that.resource.likes);
					test.done();
				});
			});
		}
	}
}