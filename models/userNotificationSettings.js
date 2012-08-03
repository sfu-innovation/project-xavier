var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"],
		logging: false
	}
);

var UserNotificationSettings = exports.UserNotificationSettings = db.define('UserNotificationSettings', {
	user: {type: Sequelize.STRING, allowNull: false},
	app: { type: Sequelize.INTEGER, allowNull: false},
	notificationOnNewResource : {type: Sequelize.INTEGER, defaultValue: 0},
	notificationOnLike : {type: Sequelize.INTEGER, defaultValue: 0},
	notificationOnComment : {type: Sequelize.INTEGER, defaultValue: 0},
	notificationOnStar : {type: Sequelize.INTEGER,defaultValue: 0}
});
var validTimes = [0, 1, 2, 3 ];

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

/*
 This updates the user notification settings. It is important to note that we dont 
 at this time alert the user that the updated settings are wrong but we just wont add
 those values into the db. This should help preserve our database integrity.
 
  args = {
  	usernotificationsettings : the object representation of the user notification setting
  	to be updated
  	
  	notificationOnNewResource : 0 - 3
  	notificationOnLike      : 0 - 3
  	notificationOnComment   : 0 - 3
  	notificationOnStar      : 0 - 3
  	
  }
  
  returns an error if not possible to update or else the updated user notification settings
*/
exports.updateUserNotificationSettings = function(args, callback){
	if ( args === null || args === undefined){
		callback("args is null", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('usernotificationsettings') &&
	                              args.hasOwnProperty('notificationOnNewResource') &&
		                               args.hasOwnProperty('notificationOnLike') &&
		                           args.hasOwnProperty('notificationOnComment')  &&
		                            args.hasOwnProperty('notificationOnStar'));
	console.log( containsAllProperties);
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	console.log("properly updated");
	args.usernotificationsettings.updateAttributes({
		notificationOnNewResource : args.notificationOnNewResource,
		notificationOnLike        : args.notificationOnLike,
		notificationOnComment     : args.notificationOnComment,
		notificationOnStar        : args.notificationOnStar
	}).success(function(updatedSettings){
		callback( null, updatedSettings );
	}).error(function( error ){
		callback( error, null );
	});
}

/*
Builds the user notification settings that are specific to an app
(ie. each user for the original 3 apps should have 3 user notification settings )

args = {
	user : user that will be alerted,
	app  : the app which these notifications will come from
	}
	
Returns the notification setting that was created or a user
*/
exports.addNotificationSetting = function( args, callback){
	if ( args === null || args === undefined){
		callback("args is null", null);
		return;
	}
	
	var containsAllProperties = (args.hasOwnProperty('user') && args.hasOwnProperty('app'));
		
	if (!containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.app  = args.app;
	
	// we want to check if we can see see this setting, if it doesnt exist then we will
	// create a new user notification setting for this app
	
	this.findNotificationSettings( arg, function( error, notificationSettings ){
		if ( null === notificationSettings ){
			var newSettings = UserNotificationSettings.build(arg);
			newSettings.save().error(function(error){
				callback( error, null);
			}).success(function( setting ){
				callback(null, setting );
			});
		} else {
			callback( null , notificationSettings );
		}
	});
}

/*
	To get the current notification settings of a user for a particular application
	
	args = {
		user : UUID of the user 
		app  : integer to represent the app
	}
	returns the notification settings(array) or an error
*/
exports.findNotificationSettings = function(args, callback ) {
	if ( args === null || args === undefined){
		callback("args is null", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                             args.hasOwnProperty('app'));
		
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;	
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.app  = args.app;
	
	UserNotificationSettings.find({where : arg 
	}).success(function(notificationSettings ){
    	callback( null, notificationSettings );
    }).error(function(error){
    	callback( error, null );
    });
}

exports.findAllNotificationSettings = function( args, callback ){
	UserNotificationSettings.findAll().success(function(settings){
		callback( null, settings );
	}).error(function(error){
		callback( error, null );
	});
}

