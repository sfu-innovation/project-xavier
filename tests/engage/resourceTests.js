var http     = require('http');
var express  = require('express');
var fs       = require('fs');
var server   = require(__dirname + '/../../app-engage.js');
var config   = require(__dirname + '/../../config.json');
var queries  = require(__dirname + '/../../database/db-queries');
var Resource = require(__dirname + '/../../models/resource');
var User     = require(__dirname + '/../../models/user');
var dataFile = 'tests/engage/testing-data.json';
var testData = JSON.parse(fs.readFileSync(dataFile));


module.exports = {
	resourceTests:{

		// Sets up fresh database, loads minimal test data, then starts server
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
							that.course   = testData.courses[0];
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
		// Checks the rest call to get a resource from the database
		getResource: function(test){
			var that = this;
			
			this.requestOptions.method = "GET";
			this.requestOptions.path   = "/api/resource/" + this.resource.uuid;

			var request = http.get(this.requestOptions, function(response){
				body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 && body.resource.uuid === that.resource.uuid);
					test.done();
				});
			});
		},
		createResource: function(test){
			var that = this;
			var newResource = {
				user : this.user.uuid,
				course: this.course.uuid,
				title : "New Awesome Test Resource",
				description : "CATS!",
				resourceType : 1,
				likes : 100000, 
				url : "http://youtube.com/amazing-cats-lolz"
			}

			this.requestOptions.method = "POST";
			this.requestOptions.path   = "/api/resource/create";

			var request = http.request(this.requestOptions, function(response){
				body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 && body.resource.url === newResource.url);
					test.done();
				});
			});

			request.write(JSON.stringify({resource: newResource}));
			request.end();
		},
		deleteResource: function(test){
			var that = this;

			this.requestOptions.method = "DELETE";
			this.requestOptions.path = "/api/resource/" + this.resource.uuid + "/delete";

			var request = http.request(this.requestOptions, function(response){
				body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 && body.message);
					test.done();
				});
			});

			request.end();
		}

	}
}