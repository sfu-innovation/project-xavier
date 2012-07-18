var fs  = require("fs");
var config = JSON.parse( fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var UserNotification = require('./userNotification.js').UserNotification;
var UUID = require('com.izaakschroeder.uuid');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"]
	}
);

var NotificationListener = exports.NotificationListener = db.define('NotificationListener', {
	uuid: {type: Sequelize.STRING, primaryKey: true, unique: true },
	app : {type:Sequelize.INTEGER, allowNull: false},
	user : {type:Sequelize.STRING, allowNull: false},
	target: {type:Sequelize.STRING, allowNull: false},
	event:{ type:Sequelize.INTEGER, allowNULL: false}
});

/*
This is the base function for adding a notification to the notification table.
These notifications are more like listeners which help trigger user notifications
to be added to the user notifications table which are the real notifications when
specific events occur on certain objects.

**The uuid be added on in this function with the UUID.generate()  call
args = { 
	user : The user who should be notified
	target : The resource that has incurred a specific event
	event : The type event on a specific target
}

returns the newNotificationListener or an error
*/
exports.createNotificationListener = function( args, callback){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') && args.hasOwnProperty('target') &&
		args.hasOwnProperty('event') );
	if (  !containsAllProperties ){
		callback("Invalid args ", null );
		return;
		
	}
	
	var arg = new Object();
	arg.user   = args.user;
	arg.target = args.target;
	arg.event  = args.event;
	arg.app    = args.app;
	
	arg.uuid = UUID.generate();
	var newNotification = NotificationListener.build(arg);
	newNotification.save().error(function(error){
		callback( error, null );
	}).success(function( newNotificationListener ){
		callback( null, newNotificationListener );
	});
}

/*
This is when a user no longer wants specific kinds of notifications.
This is similar to someone "unfollowing" a post for example.

args = { 
	notificationlistener : object of a notificationListener to be removed
}
   returns the single removed element or an error
*/

exports.removeNotificationListener = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('notificationlistener'));
	if (!containsAllProperties || args.notificationlistener === null){
		callback("Invalid args ", null );
		return;
		
	}
	args.notificationlistener.destroy().success( function( removedElement ){
		callback(null, removedElement);
	}).error(function(error){
		callback(error, null);
	});
}

/*
	To alert all users that are listening to a specific event in an app
	
	args = {
		app    : The application in which this event occurred in
		target : THe UUID of the resource which has incurred an event
		event  : The event type that has been done on the resource
	}
	
	returns all of the notification listeners currently pointed at the combination
	of target and event OR an error
*/
exports.findAllNotificationListeners = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('app') && args.hasOwnProperty('target') &&
		args.hasOwnProperty('event') );
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;
		
	}
	
	NotificationListener.findAll({where : { app : args.app,
	                                        target : args.target,
	                                        event : args.event}
	}).success( function(notifications ){
		callback( null, notifications )
	}).error( function ( error ){
		callback( error, null );
	});
}
	/*
	To grab a specific notification listener for a specific user 
	
		args = {
			user : The user who will be alerted
			target : The resource which has changed
			event : The event which has happened on that resource
			app   : appId
		}
		
	Returns the requested notification listener ( you will still need to check for null)
	or an error
	
	*/
exports.findNotificationListener = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') && args.hasOwnProperty('target') &&
		args.hasOwnProperty('event') && args.hasOwnProperty('app'));
		
	if (!containsAllProperties ){
		callback("Invalid args ", null );
		return;
		
	}
	NotificationListener.find( { where : { user : args.user,
								   target : args.target,
								   event : args.event,
								   app    : args.app }
	}).success( function(notification) {
		callback(null, notification);
	}).error(function(error){
		callback(error, null);
	});
}

