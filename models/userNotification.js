var fs  = require("fs");
var config = JSON.parse( fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var async = require('async');
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
exports.selectUserNotifications = function(args, callback){
	UserNotification.findAll({ where : {listener : args.listener}
	}).success( function(notifications){
		callback( null, notifications );
	}).error(function(error){
		callback( error, null );
	});
}

/*
	Gets user notifications at a certain time that have been unsent
	args = {
		wait : 0-3 time when email should be sent
	}
	returns an error or an array of unsent notifications set to go off at a certain time
*/
exports.selectUnsentUserNotificationsByTime = function(args, callback){
	UserNotification.findAll({where : { wait: args.wait, emailSent: false }}).success(function( notifications){
		callback(null,notifications);
	}).error(function(error){
		callback( error, null);
	});
}

/*
    To disable email notification from being sent from the indicated user notifications 
    
	args = {
		usernotifications : notifications to be set to sent	
	}
	
	return the newly updated user notifications
*/
exports.markAsSentUserNotifications = function( args, callback ){
	var arr = new Array();
	async.forEachSeries( args.usernotifications, function( notification, callback ){
		notification.updateAttributes({ emailSent : true }).error(function(error){
			callback(error);
		}).success(function(updatedAttribute){
			arr.push(updatedAttribute);
			callback();
		})
	}, function ( err ){
		if ( err ){
			callback ( err, null );
		}
		else {
			callback( null, arr );
		}
	});
}

/*
	To remove a user notification
	
	args = {
		usernotifications : object representation of the user notification to be removed
	}
	
	Returns the removed user notification or an error
*/
exports.removeUserNotifications = function( args, callback) {
	var arr = new Array();
	async.forEachSeries( args.usernotifications, function( userNotification, callback){
		userNotification.destroy().error(function(error){
			callback( error );
		}).success(function(){
			arr.push( userNotification );
			callback();
		});
			
	}, function(error){
		if ( error ){
			callback( error, null );
		} else {
			callback( null, arr );
		}
	});
}

/*
	To create a user notification 
	
	args = { 
		listener    : the listener responsible for this notification
		description :  The description of the notification
		emailSent : false/true
		wait      : when the email should be sent 0-3
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