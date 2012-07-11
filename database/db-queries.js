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

var Course = require('../models/course.js').Course;
var CourseMember = require('../models/courseMember.js').CourseMember;
var Notification = require('../models/notification.js').Notification;
var Resource = require(__dirname + '/../models/resource.js').Resource;
var User = require('../models/user.js').User;
var UserNotification = require('../models/userNotification.js').UserNotification;
var UserNotificationSettings = require('../models/userNotificationSettings.js').UserNotificationSettings;
var MediaFile = require('../models/mediafile.js').MediaFile;
var Tag = require('../models/tag.js').Tag;
var UserProfile = require('../models/userProfile.js').UserProfile;

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
			
			async.parallel([
				createTable.bind(undefined, User), 
				createTable.bind(undefined, Course), 
				createTable.bind(undefined, Notification), 
				createTable.bind(undefined, CourseMember), 
				createTable.bind(undefined, UserNotification), 
				createTable.bind(undefined, UserNotificationSettings), 
				createTable.bind(undefined, Resource),
				createTable.bind(undefined, MediaFile),
				createTable.bind(undefined, Tag),
				createTable.bind(undefined, UserProfile)
				], callback)
		}
	});
}

var createTable = function(table, callback){
	table.sync().success(function(){
		callback(null, true);
	}).error(function(){
		console.log("very weird thing happeend bro");
		callback(error, null);
	})
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
				callback(error, null);
			}
			console.log("Couldn't delete database " + error);
		}
		else{
			if(callback){
				callback(null, true);
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
		insert.bind(undefined, User, data.users)
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
