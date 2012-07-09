var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var mysql   = require("mysql").createClient({
	host: config.mysqlDatabase["host"],
	user: config.mysqlDatabase["user"],
	password: config.mysqlDatabase["password"],
	port: config.mysqlDatabase["port"],
	});

var Sequelize = require('sequelize');
var User = require('../models/user.js').User;
var Course = require('../models/course.js').Course;
var CourseMember = require('../models/courseMember.js').CourseMember;
var Notification = require('../models/notification.js').Notification;
var UserNotification = require('../models/userNotification.js').UserNotification;
var UserNotificationSettings = require('../models/userNotificationSettings.js').UserNotificationSettings;


exports.createDB = function(dbName, callback){
	var mysql   = require("mysql").createClient({
		host: config.mysqlDatabase["host"],
		user: config.mysqlDatabase["user"],
		password: config.mysqlDatabase["password"],
		port: config.mysqlDatabase["port"]
	});

	mysql.query('CREATE DATABASE IF NOT EXISTS ' + dbName + ' CHARACTER SET \'utf8\''
		, function(err){
		if(err){
			callback(0);
			console.log("Unable to create db " + err);
			return;
		}
		//Database created succesfully, create tables now
		else{
			console.log("Database created! Creating tables...\n");
			mysql.end();
			User.sync().success(function(){
				Course.sync().success(function(){
					Notification.sync().success(function(){
						CourseMember.sync().success(function(){
							UserNotification.sync().success(function(){
								UserNotificationSettings.sync().success(function(){
									if(callback){
										callback(1);
									}
								});
							});

						});
					});
				});
			})
		}
	});
}

exports.dropDB = function(dbName, callback){
	var mysql   = require("mysql").createClient({
		host: config.mysqlDatabase["host"],
		user: config.mysqlDatabase["user"],
		password: config.mysqlDatabase["password"],
		port: config.mysqlDatabase["port"]
	});

	mysql.query('DROP DATABASE ' + dbName, function(error){
		console.log("DELETING");
		if(error){
			if(callback){
				callback(0);
			}
			console.log("Couldn't delete database " + error);
		}
		else{
			if(callback){
				callback(1);
			}
			console.log("Database " + dbName + " deleted");
		}
		mysql.end();
	});
}

exports.insertData = function(dataFile, dbName, dbUser, dbPassword, dbHost){
	
	var db = new Sequelize(
		dbName,	
		dbUser,	
		dbPassword,
		{
			host: dbHost
			, logging: false
			, define: {charset:'utf8'}
		}
	);
	
	var data  = JSON.parse(fs.readFileSync(dataFile));

	for(index in data.courses){
		var course = Course.create(data.courses[index]).success(function(course){
			course.save().error(function(error){
				console.log("Failed to insert course " + error);
			})
		})
	}
	for(index in data.users){
		var user = User.build(data.users[index]);

		user.save().error(function(error){
			console.log("Failed to insert user " + error);
		})
	}
	for(index in data.courseMembers){
		var member = CourseMember.build(data.courseMembers[index]);

		member.save().error(function(error){
			console.log("Failed to insert course member " + error);
		})
	}
	for(index in data.notification){
		var notification = Notification.build(data.notification[index]);

		notification.save().error(function(error){
			console.log("Failed to insert notification " + error);
		})
	}
	
	for(index in data.usernotification){
		var userNotification = UserNotification.build(data.usernotification[index]);

		userNotification.save().error(function(error){
			console.log("Failed to insert user notification " + error);
		})
	}
	
	for(index in data.usernotificationsettings){
		var userNotificationSettings = UserNotificationSettings.build(data.usernotificationsettings[index]);

		userNotificationSettings.save().error(function(error){
			console.log("Failed to insert user notification settings " + error);
		})
	}
}
