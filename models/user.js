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
		host: config.mysqlDatabase["host"]
		//logging: false
	}
);

var User = exports.User = db.define('User', {
	uuid: {type: Sequelize.STRING, primaryKey: true},
	type: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
	firstName: {type: Sequelize.STRING, allowNull: false},
	lastName: {type: Sequelize.STRING, allowNull: false},
	preferedName: {type: Sequelize.STRING, allowNull: true},
	userID: {type: Sequelize.STRING, unique: true},
	email: {type: Sequelize.STRING, unique: true, validate:{isEmail: true}}
});

//Saves user to database
//User gets passed in as a JSON object
exports.createUser = function(user, callback){
	user.uuid = UUID.generate();
	User.create(user).error(function(error){
		callback(error, null);
	}).success(function(){
		callback(null, user);
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

exports.selectUserByUUID = function(userUUID, callback){
	User.find({where: {uuid: userUUID}}).success(function(user) {
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

//Gets all the courses associated with a certain user
exports.getUserCourses = function(userUUID, callback){
	CourseMember.findAll({where: {user:userUUID}}).success(function(memberRows){
		
		//Build the list of course uuids
		if(memberRows.length > 0){
			var i;
			var courseUUIDs = [];
			for(i=0; i<memberRows.length; ++i){
				courseUUIDs.push(memberRows[i].course);
			}
		}

		//Get the courses
		if(courseUUIDs){
			Course.findAll({where: {uuid: courseUUIDs}}).success(function(userCourses){
				callback(null, userCourses);
			}).error(function(error){
				callback(error, null);
				console.log("Couldn't find users courses " + error);
			})	
		}
		//No courses were found
		else{
			callback(null, []);
		}

	}).error(function(error){
		callback(error, null);
		console.log("Can't find user " + error);
	})
}

exports.setPreferedName = function(userUUID, newName, callback){

	User.find({where: {uuid:userUUID}}).success(function(user){
		user.updateAttributes({
			preferedName: newName
		}).success(function(user){
			callback(null, user);
		}).error(function(error){
			callback(error, null);
		})
	}).error(function(error){
		callback(error, null);
	})
}

exports.updateFullName = function(userUUID, fName, lName, callback) {

	User.find({where: {uuid:userUUID}}).success(function(user){
		user.firstName = fName,
		user.lastName = lName;
		user.save().success(function(user){
			callback(null, user);
		}).error(function(error){
			callback(error, null);
		})
	}).error(function(error){
		callback(error, null);
	})

}