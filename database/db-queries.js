var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var mysql   = require("mysql").createClient({
	host: config.mysqlDatabase["host"],
	user: config.mysqlDatabase["user"],
	password: config.mysqlDatabase["password"],
	});
var Sequelize = require('sequelize');
var User = require('../models/user.js').User;
var Course = require('../models/course.js').Course;


exports.createDB = function(dbName, callback){
	mysql.query('CREATE DATABASE IF NOT EXISTS ' + dbName + ' CHARACTER SET \'utf8\''
		, function(err){
		if(err){
			console.log("Unable to create db " + err);
			return;
		}
		//Database created succesfully, create tables now
		else{
			console.log("Database created! Creating tables...\n");
			mysql.end();
			User.sync().success(function(){
				Course.sync().success(function(){
					if(callback){
						callback();
					}
				});	
			});
		}
	});
}

exports.dropDB = function(dbName, callback){
	mysql.query('DROP DATABASE ' + dbName, function(error){
		if(error){
			console.log("Couldn't delete database " + error);
		}
		else{
			if(callback){
				callback();
			}
			console.log("Database " + dbName + " deleted");
		}
		mysql.end();
	})
}

exports.insertData = function(dataFile, dbName, dbUser, dbPassword, dbHost){
	
	var db = new Sequelize(
		dbName,	
		dbUser,	
		dbPassword,
		{
			host: dbHost,
			define: {charset:'utf8'}
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
}
