var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var Course = require('./course.js').Course;
var CourseMember = require('./courseMember.js').CourseMember;
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

var User = exports.User = db.define('User', {
	uuid: {type: Sequelize.STRING, primaryKey: true},
	type: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
	firstName: {type: Sequelize.STRING, allowNull: false},
	lastName: {type: Sequelize.STRING, allowNull: false},
	userID: {type: Sequelize.STRING, unique: true},
	email: {type: Sequelize.STRING, unique: true, validate:{isEmail: true}},
	
	notificationOnResource : {type: Sequelize.STRING, defaultValue: "now"},
	notificationOnQuestion: {type: Sequelize.STRING, defaultValue: "now"},
	notificationOnTag : {type: Sequelize.STRING, defaultValue: "now"},
	notificationOnLike : {type: Sequelize.STRING, defaultValue: "now"},
	notificationOnComment : {type: Sequelize.STRING, defaultValue: "now"},
	notificationOnStar : {type: Sequelize.STRING,defaultValue: "now"},
	
	lastWatchedTag: {type: Sequelize.STRING}
});

//Saves user to database
//User gets passed in as a JSON object
exports.createUser = function(user, callback){
	user.uuid = UUID.generate();
	var newUser = User.build(user);
	newUser.save().error(function(error){
		console.log("Failed to insert user " + error);
	})
}

exports.selectUser = function(args, callback){
	User.find({where: args}).success(function(user) {
		callback(null, user);
	}).error(function(error) {
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
	CourseMember.findAll({where: args}).success(function(memberRows){
		if(memberRows.length > 0){
			var i;
			var courseUUIDs = [];
			for(i=0; i<memberRows.length; ++i){
				courseUUIDs.push(memberRows[i].course);
			}
		}

		if(courseUUIDs){
			Course.findAll({where: {uuid: courseUUIDs}}).success(function(userCourses){
				callback(null, userCourses);
			}).error(function(error){
				callback(error, null);
				console.log("Couldn't find users courses " + error);
			})	
		}
		else{
			callback(null, []);
		}

	}).error(function(error){
		callback(error, null);
		console.log("Can't find user " + error);
	})
}