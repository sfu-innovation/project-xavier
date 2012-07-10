var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var Tag = require('../../../models/tag.js');

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
		"Select Tag": function(test){
			Tag.selectTag({'target_uuid':'abc1231'}, function(error, tag){
				test.ok(tag.title.should.be.eql("soccer dribble"));
				test.done();
			});
		},
		"Find UserTag": function(test){
			Tag.getUserTag({'target_uuid':'abc1230'}, function(error, userTag){
				test.ok(userTag.firstName.should.be.eql("Mike"));
				test.done();
			});
		},		
		"Create Tag": function(test){
			var newTag = {
				user_uid:"BSDF787D98A7SDF8ASD7G1",
				start:12,
				end:34,			
				type:2,
				target_uuid:"abc1234",
				title:"super magic dribble",
				description:"bend it like beckham",
				question_uid:"aJfznhseQuOicWWAjx7F00",
				important:true,
				interest:false,
				examable:true,
				reviewlater:true,
				shared:false
			}
			Tag.createTag(newTag, function(error, tag){					
				test.ok(tag.should.have.property('description'));
				test.done();	
			})
		}
	},
}