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
		//logging: false
	}
);

var UserProfile = exports.UserProfile = db.define('UserProfile', {
	user: {type: Sequelize.STRING, primaryKey: true},
	profilePicture: {type: Sequelize.STRING, allowNull: true},
	bio: {type: Sequelize.TEXT, allowNull: true},
	lastWatchedTag: {type: Sequelize.STRING}
});

exports.getUserProfile = function(userUUID, callback){
	UserProfile.find({where: {user:userUUID}}).success(function(profile){
		if(profile){
			callback(null, profile);
		}
		else{
			UserProfile.create({
				user:userUUID
			}).success(function(profile){
				callback(null, profile);
			}).error(function(error){
				callback(error, null);
			})
		}

	}).error(function(error){
		callback(error, null);
	})
}

exports.updateProfile = function(userUUID, args, callback){
	UserProfile.find({where: {user: userUUID}}).success(function(profile){
		profile.updateAttributes(args).success(function(thing){
			callback(null, thing);
		}).error(function(error){
			callback(error, null);
		})
	}).error(function(error){
		callback(error, null);
	})
}