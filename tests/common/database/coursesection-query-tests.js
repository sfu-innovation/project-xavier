var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var CourseSection = require('../../../models/sectionMaterial.js');

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
		"Get CourseSections": function(test){
			CourseSection.sectionsInCourse({ "course" : "A827346H7ASDFG9" }, function( error, courseSections ){
				test.ok(courseSections.should.have.lengthOf(3));
				test.done();
			});
		},
	
		"Create CourseSection": function(test){
			CourseSection.sectionsInCourse({ "course" : "A827346H7ASDFG9" }, function( error, courseSections ){
				courseSections.should.have.lengthOf(3);
			});
			CourseSection.createCourseSection({ "course" : "A827346H7ASDFG9", "section":"A827341H8BFSSFG9", "app":2 }, function( error, courseSection ){
				test.ok(courseSection.should.have.property('course', 'A827346H7ASDFG9'));
				test.ok(courseSection.should.have.property('section', 'A827341H8BFSSFG9'));
			});
			CourseSection.sectionsInCourse({ "course" : "A827346H7ASDFG9" }, function( error, courseSections ){
				test.ok(courseSections.should.have.lengthOf(4));
				test.done();
			});
		},
		"Remove CourseSection":function(test){
			args = {
				section : 'A827346H7AFSSFG9'
			}
			
			CourseSection.removeCourseSection( args, function(error, courseSection ){
				test.ok(courseSection.should.have.property('course', 'A827346H7ASDFG9'));
				test.ok(courseSection.should.have.property('section', 'A827346H7AFSSFG9'));
				test.ok(courseSection.should.have.property('app', 2 ));
				
			});
			
			var args2 = {
				course : 'A827346H7ASDFG9'
			}
			
			CourseSection.sectionsInCourse( args2, function( error, courseSections ){
				test.ok(courseSections.should.have.lengthOf(3));
				test.done();
			});
		}
	}
}