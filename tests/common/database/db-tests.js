var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');

module.exports = {

	createDeleteTests:{
		
		setUp: function(callback){
			callback();
		},
		tearDown: function(callback){
			callback();
		},
		"db_creation": function(test){
			queries.createDB(config.mysqlDatabase["db-name"], function(error, result){
				if(!error){
					test.ok(result);
				}
				test.done();
			});
		},
		"db_deletion": function(test){
			queries.dropDB(config.mysqlDatabase["db-name"], function(error, result){
				if(!error){
					test.ok(result);
				}
				test.done();
			});
		}
	}
}