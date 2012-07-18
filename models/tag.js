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
		host: config.mysqlDatabase["host"]
	}
);

var Tag = exports.Tag = db.define('Tag', {
	uuid: {type: Sequelize.STRING, primaryKey:true, allowNull:false},
	user: {type: Sequelize.STRING, allowNull:false},
	start: {type: Sequelize.INTEGER, allowNull: false},
	end: {type: Sequelize.INTEGER},
	type: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
	target: {type: Sequelize.STRING, allowNull: false},
	title: {type: Sequelize.STRING},	
	description: {type: Sequelize.STRING},
	question: {type: Sequelize.STRING},
	important: {type: Sequelize.BOOLEAN,defaultValue: 0},
	interest: {type: Sequelize.BOOLEAN,defaultValue: 0},
	examable: {type: Sequelize.BOOLEAN,defaultValue: 0},
	reviewlater: {type: Sequelize.BOOLEAN,defaultValue: 0},
	shared: {type: Sequelize.BOOLEAN,defaultValue: 0}
});

//Saves tag to database
//Tag gets passed in as a JSON object
exports.createTag = function(tag, callback){

	tag.uuid = UUID.generate();
	var newTag = Tag.build(tag);
	newTag.save().error(function(error){
		callback(error, null);
	}).success(function(){
		callback(null, newTag);
	})
}

exports.selectTag = function(args, callback){
	Tag.find({where: args}).success(function(tag) {
		callback(null, tag);
	}).error(function(error) {
		callback(error, null);
		console.log("Couldn't find tag " + error);
	});
}

exports.selectTags = function(args, callback){
	Tag.findAll({where: args}).success(function(tags){
		callback(null, tags);
	}).error(function(error){
			callback(error, null);
			console.log("Failed to select tags " + error);
		});
}


//Update a tag with specified attributes
exports.updateTag = function(uuid, args, callback){
	Tag.find({where: uuid}).success(function(tag) {
		tag.updateAttributes(args).success(function(updatedTag) {
			callback(null, updatedTag);
		});
	}).error(function(error) {
			callback(error, null);
			console.log("Couldn't find tag " + error);
		});
}

//Delete a tag with specified attributes
exports.deleteTag = function(args, callback) {
	Tag.find({where: args}).success(function(tag) {
		tag.destroy().success(function(obj) {
			callback(null, obj);
			/*
			 if (obj && obj.deletedAt) {
			 callback(null, obj);
			 }
			 */
		}).error(function(error) {
				callback(error, null);
				console.log("Couldn't delete the tag " + error);
			});
	}).error(function(error) {
			callback(error, null);
			console.log("Couldn't find tag " + error);
		});
}





//Gets a tag that belongs to a user
exports.getUserTag = function(args, callback){
	Tag.find({where: args}).success(function(tag){		
		var UserTag = require('./user.js').User;
		UserTag.find({where: {uuid: tag.user}}).success(function(userTag){
			callback(null, userTag);
		}).error(function(error){
			callback(error, null);
		});
	})
}


