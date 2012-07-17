var http     = require('http');
var express  = require('express');
var fs       = require('fs');
var server   = require(__dirname + '/../../app-engage.js');
var config   = require(__dirname + '/../../config.json');
var queries  = require(__dirname + '/../../database/db-queries');
var Resource = require(__dirname + '/../../models/resource');
var User     = require(__dirname + '/../../models/user');
var Star     = require(__dirname + '/../../models/star');
var dataFile = 'tests/engage/testing-data.json';
var testData = JSON.parse(fs.readFileSync(dataFile));

module.exports = {
	starTests:{
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
		starResource: function(test){
			var that = this;
			this.requestOptions.method = "POST";
			this.requestOptions.path   = "/api/star";

			var request = http.request(this.requestOptions, function(response){
				body = "";
				response.on('data', function(chunk){
					body += chunk;
				}).on('end', function(){
					body = JSON.parse(body);
					test.ok(body.errorcode === 0 &&
						body.star.user === that.user.uuid &&
						body.star.resource === that.resource.uuid);
					test.done();
				});
			});
			request.write(JSON.stringify({uuid: this.resource.uuid}));
			request.end();
		},
		unstarResource: function(test){
			var that = this;

			Star.starResource(this.user.uuid, this.resource.uuid, function(error, result){
				if(error){
					test.ok(false);
					test.end();
				}
				else{
					that.requestOptions.method = "DELETE";
					that.requestOptions.path   = "/api/star";

					var request = http.request(that.requestOptions, function(response){
						var body = "";
						response.on('data', function(chunk){
							body += chunk;
						}).on('end', function(){
							body = JSON.parse(body);
							test.ok(body.errorcode === 0 &&
								body.star.user === that.user.uuid &&
								body.star.resource === that.resource.uuid);
							test.done();
						});
					});

					request.write(JSON.stringify({uuid: that.resource.uuid}));
					request.end();
				}
			});
		}
	}
}