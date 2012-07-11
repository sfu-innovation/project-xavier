var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var UUID = require('com.izaakschroeder.uuid');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"],		
	}
);

var MediaFile = exports.MediaFile = db.define('MediaFile', {
	user_uid: {type: Sequelize.STRING},
	target_uuid: {type: Sequelize.STRING, primaryKey: true, allowNull: false},	
	title: {type: Sequelize.STRING, allowNull: false},
	path: {type: Sequelize.STRING, allowNull: false},	
	type: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0}	
});

//Saves media file to database
//MediaFile gets passed in as a JSON object
exports.createMediaFile = function(media, callback){
	media.target_uuid = UUID.generate();
	var newMediaFile = MediaFile.build(media);
	newMediaFile.save().error(function(error){		
		callback(error, null);
	}).success(function(){		
		callback(null, newMediaFile);
	})
}

exports.selectMediaFile = function(args, callback){
	MediaFile.find({where: args}).success(function(mediaFile) {
		callback(null, mediaFile);
	}).error(function(error) {
		callback(error, null);
		console.log("Couldn't find mediaFile " + error);
	});
}

exports.selectMediaFiles = function(args, callback){
	MediaFile.findAll({where: args}).success(function(mediaFiles){		
		callback(null, mediaFiles);
	}).error(function(error){
		callback(error, null);
		console.log("Failed to select mediaFiles " + error);
	});
}

//Gets a mediaFile that is created by user
exports.getMediaFileUser = function(args, callback){
	MediaFile.find({where: args}).success(function(mediaFile){		
		var MediaFileUser = require('./user.js').User;
		MediaFileUser.find({where: {uuid: mediaFile.user_uid}}).success(function(mediaFileUser){
			callback(null, mediaFileUser);
		}).error(function(error){
			callback(error, null);
		});
	})
}

//Gets all the tags that belongs to a media file
exports.getMediaFileTags = function(args, callback){
	var Tag = require('./tag.js').Tag;
	Tag.findAll({where: args}).success(function(tags){
		callback(null, tags);
	}).error(function(error){
		callback(error, null);
		console.log("Couldn't find media file tags " + error);
	})
}

//Update a media file with spcified attributes
exports.updateMediaFile = function(target_uuid, args, callback){
	MediaFile.find({where: target_uuid}).success(function(mediaFile) {		
		mediaFile.updateAttributes(args).success(function(updatedMedia) {
			console.log("updated succesfully");
			callback(null, updatedMedia);
		});			
	}).error(function(error) {
		callback(error, null);
		console.log("Couldn't find mediaFile " + error);
	});


}