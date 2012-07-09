var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var User = require('../../../models/user.js');

module.exports = {

	userTests:{
		
		setUp: function(callback){
			queries.dropDB(config.mysqlDatabase["db-name"], function(){
				queries.createDB(config.mysqlDatabase["db-name"], function(){
					queries.insertData(
						'./database/test-data.json'
						, config.mysqlDatabase["db-name"]
						, config.mysqlDatabase["user"]
						, config.mysqlDatabase["password"]
						, config.mysqlDatabase["host"]
						, callback
					);
				});
			});
		},
		tearDown: function(callback){
			queries.dropDB(config.mysqlDatabase["db-name"], function(){
				callback();
			});
		},
		"Select User": function(test){
			User.selectUser({'userid':'mak10'}, function(error, user){
				test.ok(user.userID.should.be.eql("mak10"));
				test.done();
			});
		},
		
		"Create User": function(test){
			var newUser = {
				firstName: "test"
				, lastName: "user"
				, userID: "test1234"
				, email: "test1234@sfu.ca"
				, type: 0
			}
			User.createUser(newUser, function(error, user){
				test.ok(user.should.have.property('uuid'));
				test.done();	
			})
		}
	},
}