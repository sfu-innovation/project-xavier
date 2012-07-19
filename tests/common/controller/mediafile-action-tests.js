var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');

var MediaAction = require('../../../controller/MediaAction.js');

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
		
		"Add MediaFile" : function( test ){
			var args = {
				user:"A7S7F8GA7SD98A7SDF8ASD7Z",				
				title:"How to drive porche",
				path:"http://www.youtube.com/porche",
				type:1
			}
			MediaAction.addMediaFile(args, function(err, media){
				test.ok(media.should.have.property( 'user', args.user ));
				test.done();
			});
		},
		"Get a MediaFile By ID" : function( test ){
			var args = {
				uuid:"abc1230"
			}
			MediaAction.getMediaFileById(args, function(err, media){
				test.ok(media.should.have.property( 'title', 'How to dunk like MJ' ));
				test.done();
			});
		},
		"View All the MediaFiles" : function( test ){
			var args = {
				type:0
			}
			MediaAction.viewMedia(args, function(err, media){
				test.ok(media.should.have.lengthOf(2));
				test.done();
			});
		},
		"Get a MediaFile Tag By ID" : function( test ){
			var args = {
				uuid:"abc1233"
			}
			MediaAction.getMediaFileTags(args, function(err, tags){
				test.ok(tags.should.have.lengthOf(1));
				test.ok(tags[0].should.have.property( 'description', 'basicaly formula that all students must memorize' ));
				test.done();
			});
		},
		"Update MediaFile" : function( test ){
			var arg = {
				uuid:"abc1234"				
			}

			var args = {
				'title':'torfino kick', 
				'path':'www.torfino.com'
			}
			MediaAction.updateMediaFile(arg, args, function(err, media){
				test.ok(media.should.have.property( 'title', args.title ));
				test.done();
			});
		},
		"Delete MediaFile" : function( test ){
			var args = {
				uuid:"abc1231"				
			}
			MediaAction.deleteMediaFile(args, function(err, media){
				test.ok(media.should.have.property( 'uuid', args.uuid ));
				test.done();
			});
		}
		
	}
}
