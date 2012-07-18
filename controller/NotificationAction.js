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
}

returns a list of teh new user notifications created
*/

NotificationAction.prototype.addUserNotification = function( args, callback ){
	var self = this;
	var addedUserNotifications = new Array();
	var argsWithListeners = new Array();
	NotificationListener.findAllNotificationListeners( args, function( error, listeners ){
		async.forEachSeries( listeners, function( listener, callback ) {
			UserNotificationSettings.findNotificationSettings( listener, function( error, settings ){
				//omg, if no user found then what? settings will be null..
				if(settings){
					switch(args.event){
						case 0: args.wait = settings.notificationOnLike       ; break;
						case 1: args.wait = settings.notificationOnComment    ; break;
						case 2: args.wait = settings.notificationOnStar       ; break;
						case 3: args.wait = settings.notificationOnNewResource; break;
					}
					//by default email notification has not been sent yet
					if ( 0 == args.wait ) {
						args.emailSent = true;
					} else {
						args.emailSent = false;
					}
				}
				delete args.target;
				delete args.event;

				//O M G. pls let me fix more things
				delete args.app;
				delete args.user;
				args.listener = listener;		//not sure, too many bugs

				//where the fuck is the callback?!, i just added it below,
				//this function will never return on a successful result
				async.series([ 
					UserNotification.createUserNotification( args, function( error, newNotification ){
						if ( error ){
							callback( error);
							return;
						}
					}),
					compileEmail( args, function( error, newNotification ){
						if ( error ){
							callback( error, null);
							return;
						}
						else {
							addedUserNotifications.push( newNotification );
						}
					})
				],function(err, results) {
					//?????added this for you cuz u need it to ensure both functions are completed
				});
			});
		} , function( err ){
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
after they are removed.

var args = {
	target : The resource which incurred an event for this user notification to be created,
	event : The event which caused this user notification to be created ,
	user : The user to be notified by the notification listener
	app  : app id
}
	returns a list of the notifiers of the removed notifications
*/
NotificationAction.prototype.removeUserNotifications = function( args, callback ){ 
	var removedUserNotifications = new Array();
	NotificationListener.findNotificationListener( args, function(error, notificationListener ){
		if ( error ){
			callback( error, null );
			return;
		}
		if ( null === notificationListener.listener){
			callback( "No notification listener could be found", null );
			return;
		}
		args.listener = notificationListener.uuid;
		UserNotification.selectUserNotifications( args, function(error, userNotifications ){
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
	NotificationListener.findNotificationListener( args, function( error, notificationListener ){
		if ( error ){
			callback( error, null );
			return;
		}
		if ( null === notificationListener ){
			callback( " No notification listener found ", null );
			return;
		}
		args.notificationlistener = notificationListener;
		NotificationListener.removeNotificationListener( args, function( error, removedListener ){
			if ( error ){
				callback( error, null );
				return;
			}
			if (  null === removedListener ) {
				callback( "No listener was removed", null );
				return;
			}
			args.listener = args.notificationlistener.listener;
			UserNotification.selectUserNotifications( args, function( error, userNotifications ){
				if ( error ){
					callback( error, null );
					return;
				}
				if ( 0 === userNotifications.length ){
					callback( "No user notifications were found matching your parameters", null );
					return;
				}
				args.usernotifications = userNotifications;
				UserNotification.removeUserNotifications( args, function( error, removedUserNotifications){
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
	NotificationListener.findNotificationListener( args, function(error, listener){
		if ( error ){
			callback( error, null );
			return;
		}
		if ( null === listener ){
			NotificationListener.createNotificationListener(args, function(error, newListener){
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
	if ( 0 != args.wait ){
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
		 			return;
		 		}
		  	});
		  	console.log('fireeeed away');
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
	args.event = 0;
	this.addNotifier( args, callback);
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
	args.event = 1;
	this.addNotifier( args, callback);
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
	args.event = 2;
	this.addNotifier( args, callback);
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
	args.event = 3;
	this.addNotifier( args, callback);
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
	args.event = 0;
	this.removeNotifier( args, callback);
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
	args.event = 1;
	this.removeNotifier( args, callback);
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
	args.event = 2;
	this.removeNotifier( args, callback);
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
	args.event = 3;
	this.removeNotifier( args, callback);
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
	var self = this;
	args.event = 0;
	var notificationArray = new Array();
	self.addNotifier( args, function( error, likeListener){
		args.event = 1;
		notificationArray.push( likeListener );
		self.addNotifier( args, function( error, commentListener){
			args.event = 2;
			notificationArray.push(commentListener );
			self.addNotifier( args, function( error, starListener){
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
	user        : UUID of the user 
	description : The message to be delivered in the notification	
}
*/
NotificationAction.prototype.addLikeUserNotification = function( args, callback){
	args.event = 0;
	this.addUserNotification(args,callback);
}

/*
To add a user notification when a resource has been commented on

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	user        : UUID of the user 
	description : The message to be delivered in the notification	
}
*/
NotificationAction.prototype.addCommentUserNotification = function( args, callback){
	args.event = 1;
	this.addUserNotification(args,callback);
}

/*
To add a user notification when a resource has been starred

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	user        : UUID of the user 
	description : The message to be delivered in the notification	
}
*/
NotificationAction.prototype.addStarUserNotification = function( args, callback){
	args.event = 2;
	this.addUserNotification(args,callback);
}

/*
To add a user notification when a resource has been added

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	user        : UUID of the user 
	description : The message to be delivered in the notification	
}

*/
NotificationAction.prototype.addNewResourceUserNotification = function( args, callback){
	args.event = 3;
	this.addUserNotification(args,callback);
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
	UserNotification.selectUserNotificationsForUserOnApp(args, function( error, notifcations ){
		if ( error ){
			callback( error , null );
		}
		else {
			callback( null, notifications );
		}
	});
}

module.exports = new NotificationAction;