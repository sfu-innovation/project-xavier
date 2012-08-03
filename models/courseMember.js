var fs        = require("fs")
var config    = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"],
		logging: false
	}
);

var CourseMember = exports.CourseMember = db.define('CourseMember', {
	course: {type: Sequelize.STRING, allowNull: false},
	user: {type: Sequelize.STRING, allowNull: false}
});

exports.addCourseMember = function(userUUID, courseUUID, callback){
	var newMember = {
		course: courseUUID,
		user: userUUID
	}
	CourseMember.create(newMember).success(function(courseMember){
		callback(null, courseMember);
	}).error(function(error){
		callback(error, null);
	})
}