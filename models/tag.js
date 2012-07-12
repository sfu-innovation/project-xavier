var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"],		
	}
);

var Tag = exports.Tag = db.define('Tag', {
	user_uid: {type: Sequelize.STRING, primaryKey: true},	
	start: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},	
	end: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},		
	type: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
	target_uuid: {type: Sequelize.STRING},
	title: {type: Sequelize.STRING},	
	description: {type: Sequelize.STRING},
	question_uid: {type: Sequelize.STRING},
	important: {type: Sequelize.BOOLEAN},
	interest: {type: Sequelize.BOOLEAN},
	examable: {type: Sequelize.BOOLEAN},
	reviewlater: {type: Sequelize.BOOLEAN},
	shared: {type: Sequelize.BOOLEAN}				
});

//Saves tag to database
//Tag gets passed in as a JSON object
exports.createTag = function(tag, callback){
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

//Gets a tag that belongs to a user
exports.getUserTag = function(args, callback){
	Tag.find({where: args}).success(function(tag){		
		var QuestionTag = require('./user.js').User;
		QuestionTag.find({where: {uuid: tag.user_uid}}).success(function(questionTag){
			callback(null, questionTag);
		}).error(function(error){
			callback(error, null);
		});
	})
}


//Update a tag with specified attributes
exports.updateTag = function(user_uid, args, callback){
	Tag.find({where: user_uid}).success(function(tag) {		
		tag.updateAttributes(args).success(function(updatedTag) {			
			callback(null, updatedTag);
		});			
	}).error(function(error) {
		callback(error, null);
		console.log("Couldn't find tag " + error);
	});
}
