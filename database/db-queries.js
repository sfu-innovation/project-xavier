var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var mysql   = require("mysql").createClient({
	host: config.mysqlDatabase["host"],
	user: config.mysqlDatabase["user"],
	password: config.mysqlDatabase["password"],
	port: config.mysqlDatabase["port"],
	});
var async = require('async');
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

var dumb = function(){

}

exports.insertData = function(dataFile, dbName, dbUser, dbPassword, dbHost, callback){
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

	async.parallel([
		insert.bind(undefined, Course, data.courses),
		insert.bind(undefined, User, data.users),
		insert.bind(undefined, CourseMember, data.courseMembers),
		insert.bind(undefined, Notification, data.notification),
		insert.bind(undefined, UserNotification, data.usernotification),
		insert.bind(undefined, UserNotificationSettings, data.usernotificationsettings)
		], callback);
}

var insert = function(model, data, callback){
	async.forEach(data, function(object, callback) {
		model.create(object).success(function(object){
			object.save().success(function() {
				callback(undefined, object)
			}).error(function(error){
				callback(error)
			})
		})
	}, callback)

}
