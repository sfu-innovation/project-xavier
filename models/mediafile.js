var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var UUID = require('com.izaakschroeder.uuid');
var Tag = require('./tag.js').Tag;
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"]
	}
);

var MediaFile = exports.MediaFile = db.define('MediaFile', {
	uuid: {type: Sequelize.STRING, primaryKey: true, allowNull: false}, //MARK, UUID not ID OMG
	user: {type: Sequelize.STRING, allowNull: false},
	title: {type: Sequelize.STRING, allowNull: false},
	course: {type: Sequelize.STRING, allowNull: false},
	description :{type:Sequelize.STRING},//TODO: update this to graph
	path: {type: Sequelize.STRING, allowNull: false},
	type: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0}	
});

//Saves media file to database
//MediaFile gets passed in as a JSON object
exports.createMediaFile = function(media, callback){
	media.uuid = UUID.generate();
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

//Gets the user of a specific media file
exports.getMediaFileUser = function(args, callback){
	MediaFile.find({where: args}).success(function(mediaFile){		
		var MediaFileUser = require('./user.js').User;
		MediaFileUser.find({where: {uuid: mediaFile.user}}).success(function(mediaFileUser){
			callback(null, mediaFileUser);
		}).error(function(error){
			callback(error, null);
		});
	})
}

//Gets all the tags that belongs to a media file
exports.getMediaFileTags = function(mediaUUID, callback){
	Tag.findAll({where: {target: mediaUUID}}).success(function(tags){
		callback(null, tags);
	}).error(function(error){
		callback(error, null);
		console.log("Couldn't find media file tags " + error);
	})
}

// Get all the users tags for the specified media file
exports.getUserTagsByMedia = function(userUUID, mediaUUID, callback){
	console.log(userUUID + " " + mediaUUID)
	Tag.findAll({where: {user: userUUID, target: mediaUUID}}).success(function(tags){
		callback(null, tags);
	}).error(function(error){
		callback(error, null);
	})
}

//Update a media file with spcified attributes
exports.updateMediaFile = function(id, args, callback){
	MediaFile.find({where: id}).success(function(mediaFile) {
		mediaFile.updateAttributes(args).success(function(updatedMedia) {
			console.log("updated succesfully");
			callback(null, updatedMedia);
		});			
	}).error(function(error) {
		callback(error, null);
		console.log("Couldn't find mediaFile " + error);
	});
}

//Delete a media file with spcified attributes
exports.deleteMediaFile = function(args, callback) {
	MediaFile.find({where: args}).success(function(mediaFile) {
		mediaFile.destroy().success(function(obj) {
			callback(null, obj);
		}).error(function(error) {
			callback(error, null);
			console.log("Couldn't delete the mediaFile " + error);
		});
	}).error(function(error) {
		callback(error, null);
		console.log("Couldn't find mediaFile " + error);
	});
}