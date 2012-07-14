var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var Section = require('../../../models/section.js');
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
	
		"Find Section": function(test){
			var args = {
				sections : 'A827346H7AFSSFG9',
				title   : 'section description 1'
			}
			Section.findSection( args , function( error, section ){
				console.log( error );
				test.ok(section.should.have.property( 'uuid', 'A827346H7AFSSFG9'))
				test.ok(section.should.have.property( 'title', 'section description 1'));
				test.done();
			});
		},
		"Create Section": function(test){
		    var args = {
		    	sections : ["A827346H7ASDFG9","A827346H7ASDFG9","A827341H8BFSSFG9","A827341H7AFFFFG9"],
		    	title  : "Super Section",
		    	app    : 2
		    }
		    
			Section.createSection( args , function( error, section ){
				test.ok(section.should.have.property( 'title', 'Super Section' ));
				test.ok(section.should.have.property( 'uuid', section.uuid ));
				test.ok(section.should.have.property( 'app', 2 ));
				test.done();
			});
		},
		"Update Section":function(test){
			var args = {
				sections : 'A827346H7AFSSFG9',
				title : 'section description 1'
			}
			Section.findSection( args , function( error, section ){
				test.ok(section.should.have.property( 'uuid', 'A827346H7AFSSFG9'))
				test.ok(section.should.have.property( 'title', 'section description 1'));
				var args2 = {
					sectionObject : section,
					title : 'super duper section'
				}
				Section.updateSection( args2 , function( error, section ){
					test.ok(section.should.have.property( 'uuid', 'A827346H7AFSSFG9'))
					test.ok(section.should.have.property( 'title', 'super duper section'));
					test.done();
				});
			});
		},
		"Remove Section": function( test ) {
			
			var args = {
				section : 'A827346H7AFSSFG9'
			}
			Section.removeSection( args, function( error, section ){
				test.ok(section.should.have.property('title', 'section description 1'));
				test.done();
			});
			
		}
	}
}