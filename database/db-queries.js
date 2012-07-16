var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var mysql   = require("mysql").createClient({
	host: config.mysqlDatabase["host"],
	user: config.mysqlDatabase["user"],
	password: config.mysqlDatabase["password"],
	port: config.mysqlDatabase["port"],
	});

process.setMaxListeners(0)

var async = require('async');
var Sequelize = require('sequelize');

var Course = require('../models/course.js').Course;
var CourseMember = require('../models/courseMember.js').CourseMember;
var NotificationListener = require('../models/notificationListener.js').NotificationListener;
var Resource = require(__dirname + '/../models/resource.js').Resource;
var User = require('../models/user.js').User;
var UserNotification = require('../models/userNotification.js').UserNotification;
var UserNotificationSettings = require('../models/userNotificationSettings.js').UserNotificationSettings;
var MediaFile = require('../models/mediafile.js').MediaFile;
var Tag = require('../models/tag.js').Tag;
var UserProfile = require('../models/userProfile.js').UserProfile;
var Like = require('../models/like.js').Like;
var Star = require('../models/star.js').Star;
var Section = require('../models/section.js').Section;
var SectionMaterial = require('../models/sectionMaterial.js').SectionMaterial;
var CourseSection = require('../models/courseSection.js').CourseSection;

exports.createDB = function(dbName, callback){
	var mysql   = require("mysql").createClient({
		host: config.mysqlDatabase["host"],
		user: config.mysqlDatabase["user"],
		password: config.mysqlDatabase["password"],
		port: config.mysqlDatabase["port"],
		debug : false
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
			
			async.series([
				createTable.bind(undefined, User), 
				createTable.bind(undefined, Course), 
				createTable.bind(undefined, NotificationListener), 
				createTable.bind(undefined, CourseMember), 
				createTable.bind(undefined, UserNotification), 
				createTable.bind(undefined, UserNotificationSettings), 
				createTable.bind(undefined, Resource),
				createTable.bind(undefined, MediaFile),
				createTable.bind(undefined, Tag),
				createTable.bind(undefined, UserProfile),
				createTable.bind(undefined, Like),
				createTable.bind(undefined, Star),
				createTable.bind(undefined, Section),
				createTable.bind(undefined, SectionMaterial),
				createTable.bind(undefined, CourseSection)]
			, callback);
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
		port: config.mysqlDatabase["port"],
		debug : false
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

	async.series([
     	insert.bind(undefined, Course, data.courses),
		insert.bind(undefined, User, data.users),
		insert.bind(undefined, CourseMember, data.courseMembers),
		insert.bind(undefined, NotificationListener, data.notificationlistener),
		insert.bind(undefined, UserNotification, data.usernotification),
		insert.bind(undefined, UserNotificationSettings, data.usernotificationsettings),
		insert.bind(undefined, MediaFile, data.mediafiles),
		insert.bind(undefined, Tag, data.tags),
		insert.bind(undefined, Resource, data.resources),
		insert.bind(undefined, CourseSection, data.coursesections),
		insert.bind(undefined, Section, data.sections),
		insert.bind(undefined, SectionMaterial, data.sectionmaterials)
		], callback);
}

var insert = function(model, data, callback){

	if(data){
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
	else{
		callback(undefined, "no data");
	}

}
