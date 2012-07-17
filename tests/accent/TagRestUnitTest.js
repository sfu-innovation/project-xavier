var http    = require('http');
var express = require('express');
var server  = require('./../../app-accent.js');
var config  = require('./../../config.json');
var queries = require(__dirname + "/../../database/db-queries.js");

var Course  = require(__dirname + "/../../models/tag.js");

var TagAction  = require(__dirname + "/../../controller/TagAction.js");


var currentHost = config.accentServer.host;
var currentPort = config.accentServer.port;


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
		// get the details of the question created
		getCourse: function(test) {
		
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
		}		
	}
}
