var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var Course = require('../../../models/course.js');

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
		"Select Course": function(test){
			Course.selectCourse({'uuid':'A8G7S6H7ASDFG9'}, function(error, course){
				test.ok(course.number.should.be.eql(307));
				test.done();
			});
		},
		"Get Course Instructor": function(test){
			Course.getInstructor({'uuid': 'A8G7S6H7ASDFG9'}, function(error, instructor){
				test.ok(instructor['type'].should.be.eql(0));
				test.ok(instructor.userID.should.be.eql('ted'));
				test.done();	
			})
		},
		//Tests that there are the correct number of course members, and that they are all students
		"Get Course Members": function(test){
			Course.getCourseMembers({'course':'A8G7S6H7ASDFG9'}, function(error, members){
				test.ok(members.length.should.be.eql(2));
				for(index in members){
					test.ok(members[index].type.should.be.eql(1));
				}
				test.done();
			})
		}
	},
}