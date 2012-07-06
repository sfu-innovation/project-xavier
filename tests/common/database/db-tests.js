var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../database/db-queries.js');

module.exports = {

	createDeleteTests:{
		'db creation': function(test){
			queries.createDB(config.mysqlTestDatabase["db-name"], function(){
				test.ok(1);
				test.done();
			});
		}
	}
}