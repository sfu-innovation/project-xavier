var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var User = require('../../../models/user.js');

module.exports = {

	createDeleteTests:{
		
		setUp: function(callback){
			queries.createDB(config.mysqlDatabase["db-name"], function(){
				
				queries.insertData(
					'./database/test-data.json'
					, config.mysqlDatabase["db-name"]
					, config.mysqlDatabase["user"]
					, config.mysqlDatabase["password"]
					, config.mysqlDatabase["host"]
				);
				callback();
			});
		},
		tearDown: function(callback){
			queries.dropDB(config.mysqlDatabase["db-name"], function(){
				callback();
			});
		},
		"select_user": function(test){
			User.selectUser({'userID':'mak10'}, function(error, result){
				console.log("TESTING");
				test.ok(result);
				test.done();
			});
		},
		
	},
}