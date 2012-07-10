var UserNotification = require('../models/userNotification.js').UserNotification;
var UserNotificationSettings = require('../models/userNotificationSettings.js').UserNotificationSettings;
var Notification = require('../models/notification.js').Notification;
var User             = require('../models/user.js').User;
var email            = require('emailjs');
var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var server = email.server.connect({
			 user     : config.emailsettings.user
			,password : config.emailsettings.password
			,host     : config.emailsettings.host
			,ssl      : config.emailsettings.ssl
		});
var UUID = require('com.izaakschroeder.uuid');
var Course = require('../models/course.js');
		
var debug = false;

var NotificationAction = function() {	
}

/*
Designed to remove the user notifications out of the user notifications table.
This means that the user will no longer see these particular removed notifications ever
after they are removed.

var args = {
	target : The resource which incurred an event for this user notification to be created,
	attribute : The event which caused this user notification to be created ,
	user : The user to be notified by the notification listener 
}

*/
NotificationAction.prototype.removeUserNotifications = function( args, callback ){ 
	Notification.find( { where : { target: args.target, attribute : args.attribute, user : args.user }})
	.success( function(notification) {
		if ( null != notification ){
			UserNotification.findAll({ where : {uuid : notification.uuid}})
				.success( function(notifications){
				var length = notifications.length;
				var i = notifications.length - 1;
				for ( ; i >= 0; i--){
					notifications[i].destroy().error( function( error ){
						callback( error, null );
					});
				}
				callback( null, notification.uuid );
			}).error( function(error){
				callback( error, null);
			})
		}
	});
}

/*
This is when a user no longer wants specific kinds of notifications.
This is similar to someone "unfollowing" a post for example.

args = { 
	user : The user who should be notified
	target : The resource that has incurred a specific event
	attribute : The type event on a specific target
}
*/

NotificationAction.prototype.removeNotifier = function( args, callback){
	Notification.find( { where : { user : args.user, target : args.target, attribute : args.attribute }).success( function(notification) {
		if ( null != notification ){
			notification.destroy().success( function( removedElement ){
				UserNotification.findAll({ where : {uuid : removedElement.uuid}})
					.success( function(notifications){
					var i = notifications.lenght - 1;
					for ( ; i >= 0; i--){
						notifications[i].destroy().error( function( error ){
							callback( error, null );
						});
					}
					callback( null, removedElement );
				}).error( function(error){
					callback( error, null);
				})
			}).error( function( error ){
				callback( error , null );
			});
		}
	}).error( function(error){
		callback( error, null);
	});
}

/*
This is the base function for adding a notification to the notification table.
These notifications are more like listeners which help trigger user notifications
to be added to the user notifications table which are the real notifications when
specific events occur on certain objects.

**The uuid be added on in this function
args = { 
	user : The user who should be notified
	target : The resource that has incurred a specific event
	attribute : The type event on a specific target
}
*/
NotificationAction.prototype.addNotifier = function( args, callback){
	Notification.find({where: args}).success(function(notification){
		if ( null == notification ){
			args.uuid = UUID.generate();
			var newNotification = Notification.build(args);
			newNotification.save().error(function(error){
				console.log("Failed to insert notification " + error);
			});
			callback( null, newNotification );
		}
		else {
			console.log("ok it already exists");
		}
	}).error(function(error){
		console.log( error );
		callback( error , null );
	});
}

/*
Builds the user notification settings

args = {
	user : user that will be alerted,
	app  : the app which these notifications will come from
	}
*/
NotificationAction.prototype.addNotificationSetting = function( args, callback){
	var newSettings = UserNotificationSettings.build(args);
	newSettings.save().error(function(error){
		console.log("Failed to create notification setting " + error );
		callback( error, null);
	}).success(function( setting ){
		callback(null, setting );
	});
}
/*
Adds a "like" user notifier on the specific resource/question
to be triggered off a "like" event.

args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on,
	}
*/
NotificationAction.prototype.addLikeNotifier = function( args, callback){
	args.attribute = 0;
	this.addNotifier( args, callback);
}

/*
Adds a "commment" user notifier on the specific resource/question
to be triggered off a comment event.

args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on,
	}
*/
NotificationAction.prototype.addCommentNotifier = function( args, callback){
	args.attribute = 1;
	this.addNotifier( args, callback);
}

/*
Adds a "star" user notifier on the specific resource/question
to be triggered off a star event.

args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on,
	}
*/
NotificationAction.prototype.addStarNotifier = function( args, callback){
	args.attribute = 2;
	this.addNotifier( args, callback);
}

/*
Adds a "new resource" user notifier on the specific resource/question
to be triggered off a new resource event.

args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on,
	}
*/
NotificationAction.prototype.addNewResourceNotifier = function( args, callback){
	args.attribute = 3;
	this.addNotifier( args, callback);
}

/*
Removes a "like" user notifier on the specific resource/question
to be triggered off a new resource event.

args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on,
	attribute : the like attribute
	}
*/

NotificationAction.prototype.removeLikeNotifier = function( args, callback){
	args.attribute = 0;
	this.removeNotifier( args, callback);
}

/*
Removes a "comment" user notifier on the specific resource/question
to be triggered off a new comment event.

args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on,
	attribute : the comment attribute
	}
*/

NotificationAction.prototype.removeCommentNotifier = function( args, callback){
	args.attribute = 1;
	this.removeNotifier( args, callback);
}

/*
Removes a "star" user notifier on the specific resource/question
to be triggered off a star event.

args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on,
	attribute : the like attribute
	}
*/

NotificationAction.prototype.removeStarNotifier = function( args, callback){
	args.attribute = 2;
	this.removeNotifier( args, callback);
}

/*
Removes a "new resource" user notifier on the specific resource/question
to be triggered off a new resource event.

args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on,
	attribute : the like attribute
	}
*/

NotificationAction.prototype.removeNewResourceNotifier = function( args, callback){
	args.attribute = 3;
	this.removeNotifier( args, callback);
}

/*
	When a new resource is added the creator should be alerted of all likes, star,
	and comments to the resource they posted.
	
	args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on,
	attribute : the like attribute
	}
*/

*/
NotificationAction.prototype.createNewResource = function( args, callback ){
	var self = this;
	args.attribute = 1;
	self.addNotifier( args, function( err, data){
		args.attribute = 2;
		self.addNotifier( args, function( err, data){
			args.attribute = 3;
			self.addNotifier( args, function( err, data){
				callback(null, 1);
			} );
		});
	});
}

/*
	The notification listeners created for the user that created a question.
	They should only be notified of other comments on the question. That is 
	why this resembles just an add comment notifier.
	
args = {
	uuid : should be generated,
	user : user that will be alerted,
	target : resource that was acted on
	}
*/
NotificationAction.prototype.createNewQuestion = function( args, callback ){
	this.addCommentNotifier( args, callback );
}

/*
This adds a notifier to each student of a course when new material is added to the 
course.

** Need to do a check on the attribute required for this function **

args = {
	target : the UUID of the course
   }

*/
NotificationAction.prototype.setupCourseMaterialNotifiers = function( args, callback ){
	var self = this;
	Course.getCourseMembers( { course : args.target }, function( err, students ){
		var i = students.length -1;
		for(; i >= 0; i--){
			args.user = students[i].uuid;
			self.addNewResourceNotifier( args, function( error, data ){
				if ( error ){
					console.log(error);
					callback( error , null );
				}
			});
		}
		callback( null, students );
	});
}

/*
This will initialize the settings for the user in the usernotificationsettings table.
This will allow users to change their user notifications on the fly

args = {
			user : UUID corresponding to the user who owns the app settings
	}
*/
NotificationAction.prototype.initNotificationSettings = function( args, callback ){
	var self = this;
	UserNotificationSettings.find( { where : { user : args.user }}).success(function( settings){
		if ( null === settings ){
			args.app = "Accent";
			self.addNotificationSetting( args, function(err, data){
				args.app = "RQRA";
				self.addNotificationSetting( args, function( err, data ){
					args.app = "Engage";
					self.addNotificationSetting( args, function( err, data ){
						callback(1);
					});
				});
			});
		}
	});
}
/*
This prepares a user notification to be sent out as an email. Aftwards the notification
will still exist in the user notifications table but will not be sent out again. 
It can only be removed when the user sees the user notification.

message needs to be of type UserNotification or else when we try to save it will throw
an error 
*/
function compileEmail( message ){
	var msg = message;
	User.find({ where: { UUID: msg.user}}).success( function( user ){
		if ( user != null ) {
			var str = "";
			str+=("You have 1 " + msg.app + " notification!\n==================\n");
				str+=( 1+") "+ msg.description +"\n");
			str+=("\n\n Thanks for using our service,\n\t"+msg.app+" Mobile team\n\n");
			var message = {
   				text:    str,
   				from:    config.emailsettings.from,
   				to:      user.firstName+ " " +user.lastName+"<"+user.email+">",
   				subject: msg.app +" notification"
		 	};
		 	server.send(message, function(err, message){
		 		console.log(err || message);
		  	});
		  	msg.emailSent = true;
		  	msg.save().error( function( error ){
		  		callback( error , null );
		  	});
		}
	});
}
/*

We iterate through the notifications table to figure out if anyone is listening to the event
For each of listeners, we iterate through their app settings table to figure out notification intervals
We then create the user notifications based on the notification intervals to be fired out when 
the interval occurs.

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	attribute   : 0 - 3
	description : The message to be delivered in the notification	
}

TODO : separate how the functionality of finding if it is inside the table
       so we can quickly check for listeners without having to potentially add
    
       However one could argue if we dont find any listeners we just dont do anything
*/
NotificationAction.prototype.addUserNotification = function( args, callback ){
	Notification.findAll({where : 
		{ app : args.app, target : args.target, attribute : args.attribute}})
			.success( function(notifications ){
		var i = notifications.length - 1;
		for(; i >= 0; i--){
			args.user = notifications[i].user;
			args.uuid = notifications[i].uuid;
			UserNotificationSettings.find({where : { user : args.user, app : args.app}})
				.success(function( settings){
				
				switch(args.attribute){
					case 0: args.wait = settings.notificationOnLike       ; break;
					case 1: args.wait = settings.notificationOnComment    ; break;
					case 2: args.wait = settings.notificationOnStar       ; break;
					case 3: args.wait = settings.notificationOnNewResource; break;
					default: break;
				}
				//by default email notification has not been sent yet
				args.emailSent = false;
				//removing extraneous properties rather than create a whole new object
				delete args.target;
				delete args.attribute;
				//creating the user notification with the slimmed down args
				var userNotification = UserNotification.build(args);
				
				if ( args.wait == "now" ){
					compileEmail( userNotification );
				} else {
					userNotification.save().error(function(error){
						console.log("Failed to insert user notification " + error);
						callback( error, null );
					})
				}
				callback( null, userNotification);
				//This is the end of the success function for searching the user 
				//notification settings
			});
		}
	});
}
/*
var object = {
		//	"user":"A7S7F8GA7SD11A7SDF8ASD7G",
		    "app":"Accent",
		    "target":"B857346H7ASDFG9",
		    "attribute":2,
		    "description": "This is a test description"
  };


var notify = new NotificationAction();
notify.addUserNotification( object, function( err, data){
	if (data ) {
		console.log( "[SUCCESS] - "+ data);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
  */