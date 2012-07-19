var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');

var TagAction = require('../../../controller/TagAction.js');

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
		
		"Add Tag To MediaFile" : function( test ){
			var args = {
				user:"BSDF787D98A7SDF8ASD7G7",
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
			TagAction.addTag(args, function(err, tag){
				test.ok(tag.should.have.property( 'user', 'BSDF787D98A7SDF8ASD7G7' ));
				test.done();
			});
		},
		"Get a Tag By ID" : function( test ){
			var args = {
				uuid:"bbc3"
			}
			TagAction.getTagById(args, function(err, tag){
				test.ok(tag.should.have.property( 'title', 'math formula' ));
				test.done();
			});
		},
		"View All the Tags" : function( test ){
			var args = {
				important:true
			}
			TagAction.viewTags(args, function(err, tags){
				test.ok(tags.should.have.lengthOf(4));
				test.done();
			});
		},
		"Update Tag" : function( test ){
			var arg = {
				uuid:"bbc2"				
			}

			var args = {
				user:"BSDF787D98A7SDF8ASD7G8",
				start:11,
				end:77,			
				type:1,
				target:"bbc1235",
				title:"donald duck",
				description:"quack quack",
				question:"aJfznhseQuOicWWAjx7F01",
				important:true,
				interest:false,
				examable:true,
				reviewlater:true,
				shared:false
			}
			TagAction.updateTag(arg, args, function(err, tag){
				test.ok(tag.should.have.property( 'title', args.title ));
				test.done();
			});
		},
		"Delete a Tag" : function( test ){
			var args = {
				uuid:"bbc3"				
			}
			TagAction.deleteTag(args, function(err, tag){
				test.ok(tag.should.have.property( 'uuid', args.uuid ));
				test.done();
			});
		}

		
	}
}
