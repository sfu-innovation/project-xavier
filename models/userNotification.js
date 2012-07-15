var fs  = require("fs");
var config = JSON.parse( fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var db = new Sequelize(
	 config.mysqlDatabase["db-name"],
	 config.mysqlDatabase["user"],
	 config.mysqlDatabase["password"],
	
	 {
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"]
	 }
);

var UserNotification = exports.UserNotification = db.define('UserNotification', {
     listener: {type: Sequelize.STRING, allowNull: false },
	 app : {type:Sequelize.INTEGER, allowNull: false },
	 user : {type:Sequelize.STRING, allowNull: false },
	 description: {type:Sequelize.STRING, allowNull: false },
	 emailSent: {type:Sequelize.BOOLEAN, defaultValue: false },
	 wait:{ type:Sequelize.INTEGER , allowNULL: false, defaultValue: 0}
});

/*
	To select all of the user notifications under a certain listener
	
	args = {
		listener : UUID of notificationListener
	}
	
	returns all of the notifications under that listener or an error
*/
exports.selectUserNotificationsByListener = function(args, callback){
	UserNotification.findAll({ where : {listener : args.listener}
	}).success( function(notifications){
		callback( null, notifications );
	}).error(function(error){
		callback( error, null );
	});
}

/*
	To select all of the user notifications under a certain listener for a specific user
	
	args = {
		listener : UUID of notificationListener
		user     : UUID of the user 
	}
	
	returns all of the notifications under that listener or an error
*/

exports.selectUserNotificationsForUserOnListener = function(args, callback){
	UserNotification.findAll({ where : {listener : args.listener,
	                                    user     : args.user }
	}).success( function(notifications){
		callback( null, notifications );
	}).error(function(error){
		callback( error, null );
	});
}

/*
	Get all user notifications for a specific user 
	 
	 args = {
	 	user : UUID of the user  
	 	app  : ID representing the application
	 }
	 returns a set of user objects or error
*/
exports.selectUserNotificationsForUserOnApp = function( args, callback ){
	UserNotification.findAll({ where : { app : args.app,
	                                     user : args.user }
	}).success(function(notifications){
		callback( null, notifications );
	}).error(function(error){
		callback( error, null);
	});
}

/*
	To remove a user notification
	
	args = {
		usernotification : object representation of the user notification to be removed
	}
	
	Returns the removed user notification or an error
*/
exports.removeUserNotification = function( args, callback) {
	args.usernotification.destroy().error(function(error){
		callback( error, null );
	}).success(function(removedUserNotification){
		callback( null, removedUserNotification );
	});
}

/*
	To create a user notification 
	
	args = { 
		listener    : the listener responsible for this notification
		user        : The user who should be notified
		description :  The description of the notification
		app         : The application generating this notification
	}
	
	returns either the newly saved user notification or an error
*/
exports.createUserNotification = function( args, callback ) {
	var userNotification = UserNotification.build(args);
	userNotification.save().error(function(error){
		callback( error, null );
	}).success(function(savedUserNotification){
		callback( null, savedUserNotification);
	});			
}