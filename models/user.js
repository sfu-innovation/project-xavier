var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var UserCourse = require('./course.js').Course;
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	{
		host: config.mysqlDatabase["host"],
		logging: false
	}
);

var User = exports.User = db.define('User', {
	uuid: {type: Sequelize.STRING, primaryKey: true},
	type: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
	firstName: {type: Sequelize.STRING, allowNull: false},
	lastName: {type: Sequelize.STRING, allowNull: false},
	userID: {type: Sequelize.STRING, unique: true},
	email: {type: Sequelize.STRING, unique: true, validate:{isEmail: true}},
	engageConfig: {type: Sequelize.INTEGER, unique: true},
	accentConfig: {type: Sequelize.INTEGER, unique: true},
	rqraConfig: {type: Sequelize.INTEGER, unique: true},
	courses: {type: Sequelize.TEXT}
});

exports.selectUser = function(args, callback){
	User.find({where: args}).success(function(user){
		callback(null, user);
	}).error(function(error){
		callback(error, null);
		console.log("Couldn't find user " + error);
	});
}

exports.selectUsers = function(args, callback){
	User.findAll({where: args}).success(function(users){
		callback(null, users);
	}).error(function(error){
		callback(error, null);
		console.log("Failed to select users " + error);
	});
}

exports.getUserCourses = function(args, callback){
	User.find({where: args}).success(function(user){
		var courseUUIDs = JSON.parse(user.courses).courses;
		if(courseUUIDs){
			UserCourse.findAll({where: {uuid: courseUUIDs}}).success(function(userCourses){
				callback(null, userCourses);
			}).error(function(error){
				callback(error, null);
				console.log("Couldn't find users courses " + error);
			})
		}
	}).error(function(error){
		callback(error, null);
		console.log("Can't find user " + error);
	})
}