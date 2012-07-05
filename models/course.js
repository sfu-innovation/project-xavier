var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	{
		host: config.mysqlDatabase["host"],
		logging: false
	}
);


var Course = exports.Course = db.define('Course', {
	uuid: {type: Sequelize.STRING, primaryKey: true},
	title: {type: Sequelize.STRING, allowNull: false},
	section: {type: Sequelize.STRING, allowNull: false},
	subject: {type: Sequelize.STRING, allowNull: false},
	number: {type: Sequelize.INTEGER, allowNull: false},
	instructor: {type: Sequelize.STRING, allowNull: false},
	meetingtimes: {type: Sequelize.TEXT}
});

exports.selectCourse = function(args, callback){
	Course.find({where: args}).success(function(course){
		callback(course);
	}).error(function(error){
		console.log("Couldn't select course " + error);
	});
}

exports.selectCourses = function(args, callback){
	Course.findAll({where: args}).success(function(course){
		callback(course);
	}).error(function(error){
		console.log("Couldn't select course " + error);
	});
}

exports.getInstructor = function(args, callback){
	Course.find({where: args}).success(function(course){
		var CourseUser = require('./user.js').User;
		CourseUser.find({where: {uuid: course.instructor}}).success(function(courseInstructor){
			callback(courseInstructor);
		})
	})
}