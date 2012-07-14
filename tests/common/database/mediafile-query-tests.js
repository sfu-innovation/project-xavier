var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var MediaFile = require('../../../models/mediafile.js');
var tuid = '';

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
		"Select MediaFile": function(test){
			MediaFile.selectMediaFile({'target':'abc1231'}, function(error, mediaFile){
				test.ok(mediaFile.title.should.be.eql("How to dribble like Lionel"));
				test.done();
			});
		},
		"Find MediaFileUser": function(test){
			MediaFile.getMediaFileUser({'target':'abc1230'}, function(error, mediaFileUser){
				test.ok(mediaFileUser.firstName.should.be.eql("Mike"));
				test.done();
			});
		},
		"Find All MediaFileTags": function(test){
			MediaFile.getMediaFileTags({'target':'abc1231'}, function(error, tags){				
				test.ok(tags[0].title.should.be.eql('soccer dribble'));
				test.done();
			});
		},				
		"Create MediaFile": function(test){
			var newMediaFile = {
				user:"A7S7F8GA7SD98A7SDF8ASD7G",				
				title:"How to make buble tea",
				path:"http://www.youtube.com/bt",
				type:1
			}
			MediaFile.createMediaFile(newMediaFile, function(error, mediaFile){	
				tuid = mediaFile.target;
				console.log("t_uid = " + tuid);
				test.ok(mediaFile.should.have.property('target'));
				test.done();	
			})
		},				
		"Update MediaFile": function(test){
			var target = {'target':'abc1230'};
			//target.target = tuid;
			var updateAttributes = {'title':'jericho twist', 'path':'www.google.com'};
			MediaFile.updateMediaFile(target, updateAttributes, function(error, updatedMediaFile){				
				console.log("expect = " + updateAttributes.title);
				console.log("result = " + updatedMediaFile.title);
				//test.ok(updatedMediaFile.should.have.property('target'));
				test.ok(updatedMediaFile.title.should.be.eql(updateAttributes.title));
				test.done();	
			})
		},
		"Delete MediaFile": function(test){						
			MediaFile.deleteMediaFile({'target':'abc1231'}, function(error, deletedMediaFile){											
				test.ok(deletedMediaFile.target.should.be.eql('abc1231'));
				test.done();	
			})
		}
	},
}