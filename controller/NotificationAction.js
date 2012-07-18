var UserNotification = require('../models/userNotification.js');
var UserNotificationSettings = require('../models/userNotificationSettings.js');
var NotificationListener = require('../models/notificationListener.js');
var async                = require('async');
var NotificationListenerImpl = NotificationListener.NotificationListener;
var UserNotificationImpl = UserNotification.UserNotification;
var UserNotificationSettingsImpl = UserNotificationSettings.UserNotificationSettings;

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

We iterate through the notifications table to figure out if anyone is listening to the event
For each of listeners, we iterate through their app settings table to figure out notification intervals
We then create the user notifications based on the notification intervals to be fired out when 
the interval occurs.

args = {
	target      : <the resource, tag, question>
	app         : the id of the app
	event       : 0 - 3
	description : The message to be delivered in the notification	
	user        : user id of the person adding the notification
}

returns a list of teh new user notifications created
*/

NotificationAction.prototype.addUserNotification = function( args, callback ){

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	
	var containsAllProperties =  (
	                                   args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('event') &&
		                               args.hasOwnProperty('app') &&
		                               args.hasOwnProperty('description')
		                        );
		                            
	if (!containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.target = args.target;
	arg.app = args.app;
	arg.event = args.event;
	arg.description = args.description;
	
	var self = this;
	var addedUserNotifications = new Array();
	var argsWithListeners = new Array();
	NotificationListener.findAllNotificationListeners( arg, function( error, listeners ){

		async.forEachSeries( listeners, function( listener, callback ) {
			UserNotificationSettings.findNotificationSettings( listener, function( error, settings ){

				if ( settings == undefined || settings === null){
					callback("error occurred "+error, null);
					return;
				}
				if(settings){
					switch(arg.event){
						case 0: arg.wait = settings.notificationOnLike       ; break;
						case 1: arg.wait = settings.notificationOnComment    ; break;
						case 2: arg.wait = settings.notificationOnStar       ; break;
						case 3: arg.wait = settings.notificationOnNewResource; break;
					}
					//by default email notification has not been sent yet
					if ( 0 == arg.wait ) {
						arg.emailSent = true;
					} else {
						arg.emailSent = false;
					}
				}
				arg.user     = listener.user;
				arg.listener = listener.uuid;

				UserNotification.createUserNotification( arg, function( error, newNotification ){
						if ( error ){
							callback( error, null);
							
							
						}else {
							addedUserNotifications.push( newNotification );
							callback( null, newNotification);
						}
				});
				
				compileEmail( arg, function( error, newNotification ){
						if ( error ){
							callback( error, null);
							return;
						}
				});
			});
		} , function( err, results ){
			if ( err ){
				callback( err, null );
			}
			else {
				callback( null, addedUserNotifications );
			}
		});
	});
}

/*
Designed to remove the user notifications out of the user notifications table.
This means that the user will no longer see these particular removed notifications ever
after they are removed. Its ok if user is required to remove this notification as 
the notification has to already be associtaed with a specific user in order to remove it

var args = {
	target : The resource which incurred an event for this user notification to be created,
	event : The event which caused this user notification to be created ,
	user : The user to be notified by the notification listener
	app  : app id
}
	returns a list of the notifiers of the removed notifications
*/
NotificationAction.prototype.removeUserNotifications = function( args, callback ){ 

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('event') &&
		                               args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.target = args.target;
	arg.event = args.event;
	arg.user = args.user;
	arg.app  = args.app;
	
	var removedUserNotifications = new Array();
	NotificationListener.findNotificationListener( arg, function(error, notificationListener ){
		if ( error ){
			callback( error, null );
			return;
		}
		if ( null === notificationListener.listener){
			callback( "No notification listener could be found", null );
			return;
		}
		arg.listener = notificationListener.uuid;
		UserNotification.selectUserNotifications( arg, function(error, userNotifications ){
			if ( error ){
				callback( error, null );
				return;
			}
			UserNotification.removeUserNotifications({ usernotifications : userNotifications }, function( err, results ){
				if ( err ){
			 		callback( err, null );
			 	}else {
			 		callback( null, results);
			 	}
			});
			callback( null, removedUserNotifications );
		});
	})
	
}

/*
This is when a user no longer wants specific kinds of notifications.
This is similar to someone "unfollowing" a post for example.

args = { 
	user   : The user who will be alerted
	target : The resource which has changed
	event  : The event which has happened on that resource
	app    : app id 
}

returns an array of any user notifications which may have been removed as a result
of removing the listener
*/

NotificationAction.prototype.removeNotifier = function( args, callback){

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('event') &&
		                               args.hasOwnProperty('app') &&
		                               args.hasOwnProperty('listener'));
		                            
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.target = args.target;
	arg.event = args.event;
	arg.app = args.app;
	arg.listener = args.listener;
	
	NotificationListener.findNotificationListener( arg, function( error, notificationListener ){
		if ( error ){
			callback( error, null );
			return;
		}
		if ( null === notificationListener ){
			callback( " No notification listener found ", null );
			return;
		}
		arg.notificationlistener = notificationListener;
		NotificationListener.removeNotificationListener( arg, function( error, removedListener ){
			if ( error ){
				callback( error, null );
				return;
			}
			if (  null === removedListener ) {
				callback( "No listener was removed", null );
				return;
			}
			arg.listener = arg.notificationlistener.uuid;
			UserNotification.selectUserNotifications( arg, function( error, userNotifications ){
				if ( error ){
					callback( error, null );
					return;
				}
				if ( 0 === userNotifications.length ){
					callback( "No user notifications were found matching your parameters", null );
					return;
				}
				arg.usernotifications = userNotifications;
				UserNotification.removeUserNotifications( arg, function( error, removedUserNotifications){
					if ( error ){
						callback( error, null );
						return;
					}else {
						callback( null, removedUserNotifications);
					}
				});
			});
		});
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
	event : The type event on a specific target
	app   : the app this notification belongs to
}

returns the newly created listener or an error
*/
NotificationAction.prototype.addNotifier = function( args, callback){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('event') &&
		                               args.hasOwnProperty('app'));
		                            
	if (!containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.target = args.target;
	arg.event  = args.event;
	arg.app    = args.app;
	
	NotificationListener.findNotificationListener( arg, function(error, listener){
		if ( error ){
			callback( error, null );
			return;
		}
		if ( null === listener ){
			NotificationListener.createNotificationListener(arg, function(error, newListener){
				if ( error ){
					callback(error, null );
					return;
				}
				if ( null == newListener ){
					callback( "No new listener was created", null);
					return;
				}	
				callback( null, newListener );
			});
		} else {
			callback( "This specific listener already exists" , null );
		}
	});
}

/*
This prepares a user notification to be sent out as an email. Aftwards the notification
will still exist in the user notifications table but will not be sent out again. 
It can only be removed when the user sees the user notification.

	args = UserNotification object
message needs to be of type "UserNotification" or else when we try to save it will throw
an error 
*/
function compileEmail( args, callback ){

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('description') &&
		                               args.hasOwnProperty('wait'));
		                            
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	if ( 0 != args.wait ){
		callback(null, 1);
		return;
	}
	
	var msg = args;
	
	User.find({ where: { uuid: msg.user}}).success( function( userFound ){
		if ( null != userFound ) {
			var str = "";
			var title = "";
			switch ( msg.app ){
				case 0 : title = "RQRA"  ; break;
				case 1 : title = "Accent"; break;
				case 2 : title = "Engage"; break;
			}
			str+=("You have 1 " + title + " notification!\n==================\n");
				str+=( 1+") "+ msg.description +"\n");
			str+=("\n\n Thanks for using our service,\n\t"+title+" Mobile team\n\n");
			var message = {
   				text:    str,
   				from:    config.emailsettings.from,
   				to:      userFound.firstName+ " " +userFound.lastName+"<"+userFound.email+">",
   				subject: title +" notification"
		 	};
		 	server.send(message, function(err, message){
		 		if ( err ){
		 			callback( err, null );
		 		//	return;
		 		} else {
		 			callback( null, message );
		 		//	return;
		 		}
		 		
		  	});
		}
		else {
			callback( "user doesnt exist", null );
		}
	}).error(function(error){
		callback(error,null);
	});
}
/*
Adds a "like" user notifier on the specific resource/question
to be triggered off a "like" event.

args = {
	user : user that will be alerted,
	target : resource that was acted on,
	app    : the app id
	}
*/
NotificationAction.prototype.addLikeNotifier = function( args, callback){

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.app = args.app;
	arg.target = args.target;
	arg.event = 0;
	this.addNotifier( arg, callback);
}

/*
Adds a "commment" user notifier on the specific resource/question
to be triggered off a comment event.

args = {
	user : user that will be alerted,
	target : resource that was acted on,
	app    : the app id
	}
*/
NotificationAction.prototype.addCommentNotifier = function( args, callback){
	
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (!containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.app = args.app;
	arg.target = args.target;
	arg.event = 1;
	this.addNotifier( arg, callback);
}

/*
Adds a "star" user notifier on the specific resource/question
to be triggered off a star event.

args = {
	user : user that will be alerted,
	target : resource that was acted on,
	app    : the app id
	}
*/
NotificationAction.prototype.addStarNotifier = function( args, callback){

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.app = args.app;
	arg.target = args.target;
	arg.event = 2;
	this.addNotifier( arg, callback);
}

/*
Adds a "new resource" user notifier on the specific resource/question
to be triggered off a new resource event.

args = {
	user : user that will be alerted,
	app  : the application this listener is listening on
	target : resource that was acted on,
	}
*/
NotificationAction.prototype.addNewResourceNotifier = function( args, callback){

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.app = args.app;
	arg.target = args.target;
	arg.event = 3;
	
	this.addNotifier( arg, callback);
}

/*
Removes a "like" user notifier on the specific resource/question
to be triggered off a new resource event.

args = {
	user : user that will be alerted,
	target : resource that was acted on
	app    : app id
	}
*/

NotificationAction.prototype.removeLikeNotifier = function( args, callback){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.target = args.target;
	arg.app = args.app;
	arg.event = 0;
	
	this.removeNotifier( arg, callback);
}

/*
Removes a "comment" user notifier on the specific resource/question
to be triggered off a new comment event.

args = {
	user : user that will be alerted,
	target : resource that was acted on
	app    : app id
	}
*/

NotificationAction.prototype.removeCommentNotifier = function( args, callback){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.target = args.target;
	arg.app = args.app;
	arg.event = 1;
	
	this.removeNotifier( arg, callback);
}

/*
Removes a "star" user notifier on the specific resource/question
to be triggered off a star event.

args = {
	user : user that will be alerted,
	target : resource that was acted on
	app    : app id
	}
*/

NotificationAction.prototype.removeStarNotifier = function( args, callback){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.target = args.target;
	arg.app = args.app;
	arg.event = 2;
	
	this.removeNotifier( arg, callback);
}

/*
Removes a "new resource" user notifier on the specific resource/question
to be triggered off a new resource event.

args = {
	user : user that will be alerted,
	target : resource that was acted on
	app    : app id
	}
*/

NotificationAction.prototype.removeNewResourceNotifier = function( args, callback){

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.target = args.target;
	arg.app = args.app;
	arg.event = 3;
	
	this.removeNotifier( arg, callback);
}

/*
	When a new resource is added the creator should be alerted of all likes, star,
	and comments to the resource they posted.
	
	args = {
		user : user that will be alerted,
		target : resource that was acted on
		app    : app id
	}
	
	returns an array of the listeners
*/


NotificationAction.prototype.createNewResource = function( args, callback ){

	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (!containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg    = new Object();
	arg.user   = args.user;
	arg.target = args.target;
	arg.app    = args.app;
	
	var self = this;
	arg.event = 0;
	var notificationArray = new Array();
	self.addNotifier( arg, function( error, likeListener){
		args.event = 1;
		notificationArray.push( likeListener );
		self.addNotifier( arg, function( error, commentListener){
			args.event = 2;
			notificationArray.push(commentListener );
			self.addNotifier( arg, function( error, starListener){
				notificationArray.push( starListener );
				callback(null, notificationArray);
			} );
		});
	});
}

/*
	The notification listeners created for the user that created a question.
	They should only be notified of other comments on the question. That is 
	why this resembles just an add comment notifier.
	
args = {
    app  : the app id
	user : user that will be alerted,
	target : resource that was acted on
	}
*/
NotificationAction.prototype.createNewQuestion = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('app') &&
	                              args.hasOwnProperty('user') &&
		                               args.hasOwnProperty('target'));
		                            
	if (  !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.app = args.app;
	arg.user = args.user;
	arg.target = args.target;
	
	this.addCommentNotifier( args, callback );
}

/*
This adds a notifier to each student of a course when new material is added to the 
course.

** Need to do a check on the event required for this function **

args = {
	target : the UUID of the course
	app    : The application this course pertains to
   }

*/
NotificationAction.prototype.setupCourseMaterialNotifiers = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('app') &&
	                              args.hasOwnProperty('target'));
		                            
	if (  !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	var self = this;
	Course.getCourseMembers( { course : args.target }, function( err, students ){
		var i = students.length - 1;
		var students = new Array();
		var addedStudents = new Array();
		for(; i >= 0; i-- ){
			var arg = args;
			arg.user = students[i].uuid;
			students.push( arg );
		}
		async.forEachSeries( students, function( student, callback){
			self.addNewResourceNotifier( student, function( error, data ){
				if ( error ){
					callback( error );
				} else {
					addedStudents.push( data );
				}
			})
		, function(err){
			if ( err ) {
				callback( err, null );
			}else {
				callback( null, addedStudents );
			}
	     }
	    });
	});
}

/*
To add a user notification when a resource has been liked

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	description : The message to be delivered in the notification	
}
*/
NotificationAction.prototype.addLikeUserNotification = function( args, callback){
	
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('target') &&
	                              args.hasOwnProperty('app') &&
		                           args.hasOwnProperty('description'));
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	var arg = new Object();
	arg.target = args.target;
	arg.app = args.app;
	arg.description = args.description;
	arg.event = 0;
	
	this.addUserNotification(arg,callback);
}

/*
To add a user notification when a resource has been commented on

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	description : The message to be delivered in the notification	
}
*/
NotificationAction.prototype.addCommentUserNotification = function( args, callback){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('target') &&
	                              args.hasOwnProperty('app') &&
		                           args.hasOwnProperty('description'));
		                            
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.target = args.target;
	arg.app = args.app;
	arg.description = args.description;
	arg.event = 1;
	
	this.addUserNotification(arg,callback);
}

/*
To add a user notification when a resource has been starred

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	description : The message to be delivered in the notification	
}
*/
NotificationAction.prototype.addStarUserNotification = function( args, callback){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('target') &&
	                              args.hasOwnProperty('app') &&
		                           args.hasOwnProperty('description'));
		                            
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.target = args.target;
	arg.app = args.app;
	arg.description = args.description;
	arg.event = 2;
	
	this.addUserNotification(arg,callback);
}

/*
To add a user notification when a resource has been added

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	description : The message to be delivered in the notification	
}

*/
NotificationAction.prototype.addNewResourceUserNotification = function( args, callback){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('target') &&
	                              args.hasOwnProperty('app') &&
		                           args.hasOwnProperty('description'));
		                            
	if (  !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.target = args.target;
	arg.app = args.app;
	arg.description = args.description;
	arg.event = 3;
	
	this.addUserNotification(arg,callback);
}

/*
	Get all of the user notifications on a particular app for a certain user 
	args = {
		app :  ID of the app
		user : UUID of the user
	}
	Get a list of the notifications in the specific app geared the the user.
*/
NotificationAction.prototype.selectUserNotificationsForUserOnApp = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('app') &&
	                              args.hasOwnProperty('user'));
		                            
	if ( !containsAllProperties ){
		callback("Invalid args ", null );
		return;
	}
	
	var arg = new Object();
	arg.app = args.app;
	arg.user = args.user;
	
	UserNotification.selectUserNotificationsForUserOnApp( arg , function( error, notifcations ){
		if ( error ){
			callback( error , null );
		}
		else {
			callback( null, notifications );
		}
	});
}

module.exports = new NotificationAction;