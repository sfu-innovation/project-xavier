var UserNotification = require('../models/userNotification.js');
var UserNotificationSettings = require('../models/userNotificationSettings.js');
var NotificationListener = require('../models/notificationListener.js');
var UserProfile          = require('../models/userProfile.js');
var async                = require('async');
var NotificationListenerImpl = NotificationListener.NotificationListener;
var UserNotificationImpl = UserNotification.UserNotification;
var UserNotificationSettingsImpl = UserNotificationSettings.UserNotificationSettings;
var UserProfileImpl = UserProfile.UserProfile;

var User             = require('../models/user.js').User;
var email            = require('emailjs');
var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var server = email.server.connect({
			 user     : config.emailsettings.user
			,password : config.emailsettings.password
			,host     : config.emailsettings.host
			,ssl      : Boolean(config.emailsettings.ssl)
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
		console.log("[NotificationAction.addUserNotification] error - Args is not existent");
		callback(null, new Array());
		return;
	}
	
	var containsAllProperties =  (
	                                   args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('event') &&
		                               args.hasOwnProperty('app') &&
		                               args.hasOwnProperty('description') &&
		                               args.hasOwnProperty('origin')
		                        );
		                            
	if (!containsAllProperties ){
		console.log("[NotificationAction.addUserNotification] error - Invalid args");
		callback(null, new Array());
		return;
	}
	
	var arg = new Object();
	arg.target      = args.target;
	arg.app         = args.app;
	arg.event       = args.event;
	arg.description = args.description;
	arg.origin      = args.origin;
	
	var self = this;
	var addedUserNotifications = new Array();
	var argsWithListeners = new Array();
	NotificationListener.findAllNotificationListeners( arg, function( error, listeners ){
		async.forEachSeries( listeners, function( listener, callback ) {
			UserNotificationSettings.findNotificationSettings( listener, function( error, settings ){
				if ( settings == undefined || settings === null){
					console.log("[UserNotificationSettings.findNotificationSettings] error - "+error);
					callback(null, new Array());
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
				
				arg.listener = listener.uuid;
				arg.user = listener.user

				UserNotification.createUserNotification( arg, function( error, newNotification ){
						if ( error ){
							console.log("[UserNotification.createUserNotification] error - "+ error );
							callback( null, new Object());
						}else {
							addedUserNotifications.push( newNotification );

							//The root of the problem lies here.
							compileEmail( arg, function( error, newNotification ){
								if ( error ){
									console.log("[NotificationAction.compileEmail] error - "+error);
									callback( null, new Object());
								} else{
									callback( null, newNotification);
								}
							});
						}
				});
			});
		} , function( err, results ){
			if ( err ){
				console.log("[NotificationAction.addUserNotification] error - "+err);
				callback( null, new Array());
			}
			else {
				callback( null, addedUserNotifications );
			}
		});
	});
}


/*
	Removing all of the user notifications for a specific user associate with a specific target
	under a specific app
	
	args = {
		user :  the UUID of hte user
		app  : The ID of the app
		target : UUID of the target
	}
	
	returns all of the user notifications which were removed

*/
NotificationAction.prototype.retrieveUserNotificationsByUserAndTarget = function( args, callback ) {
	if ( args === null || args === undefined ){
		console.log("[NotificationAction.removeUserNotificationsByUserAndTarget] error - Args is not existent");
		callback( null, new Array());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
		                         args.hasOwnProperty('app') &&
		                        args.hasOwnProperty('target'));
		                            
	if (  !containsAllProperties ){
		console.log("[NotificationAction.removeUserNotificationsByUserAndTarget] error - Invalid args");
		callback( null, new Array());
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.app  = args.app;
	arg.target = args.target;
	
	NotificationListener.findAllNotificationListenersByTarget( arg, function( error, listeners ){
		if ( error ){
			console.log("[NotificationListener.findAllNotificationListenersByTarget] error - "+ error );
			callback(null, new Array());
			return;
		}
		else if( listeners != null ){
			var listenerArray = new Array();
			var i = listeners.length - 1;
			for ( ; i >= 0 ; i--){
				listenerArray.push( listeners[i].uuid );
			}
			var listeners = new Object();
			listeners.uuid = listenerArray;
			if ( listenerArray.length === 0 ){
				console.log("[NotificationListener.findUserSpecificNotificationListeners] error - There are no notification listeners for this user");
				callback( null , new Array());
				return;
			}
			UserNotification.findUserNotificationsByListenerUUID( listeners , function( error, usernotifications ){
			
				if ( error ){
					console.log("[UserNotification.findUserNotificationsByListenerUUID] error - " + error );
					callback( null, new Array());
				}
				else {
					//var notifications = new Object();
					//notifications.usernotifications = usernotifications;
					var userWithNotifications = new Array();
					async.forEachSeries( usernotifications, function( usernotification, callback ){
						var tempObj = new Object();
						User.find({ where : { uuid : usernotification.origin}}).success(function( foundUser ){
							NotificationListenerImpl.find({ where : { uuid : usernotification.listener}}).success(function( notificationListener) {
								UserProfileImpl.find({ where : { user : foundUser.uuid }}).success(function( userProfile){
									tempObj.profile = userProfile;
									tempObj.notificationListener = notificationListener;
								    tempObj.notification = usernotification;
								    tempObj.user         = foundUser;
								    userWithNotifications.push( tempObj );
								    callback( null, tempObj );
								}).error( function ( error) {
									console.log("[UserProfileImpl.find] error - "+error);
									callback( null, new Object());
								});
								
							}).error(function(error){
								console.log("[NotificationListenerImpl.find] error - "+ error );
								callback( null, new Object());
							});
							
						}).error( function ( error ){
							console.log("[User.find] error - "+ error );
							callback( error, new Object());
						}); 
					
					}, function ( error , results ){
						if ( error ){
							console.log("[UserNotification.findUserNotificationsByListenerUUID] error - "+error);
							callback( null , new Array());
						}
						else {
							callback( null, userWithNotifications );
						}
					});
				}
			});
		} else {
			console.log("[NotificationListener.findAllNotificationListenersByTarget] error - listeners was null");
			callback( null, new Array() );
		}
	});
}	
/*
	Removing all of the user notifications for a specific user under a specific app
	
	args = {
		user :  the UUID of hte user
		app  : The ID of the app
	}
	
	returns all of the user notifications which were removed

*/
NotificationAction.prototype.retrieveUserNotificationsByUser = function( args, callback ){
	if ( args === null || args === undefined ){
		console.log("[NotificationAction.removeUserNotificationsByUser] error - Args is not existent" );
		callback( null, new Array());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
		                         args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		console.log("[NotificationAction.removeUserNotificationsByUser] error - Invalid args");
		callback( null, new Array());
		return;
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.app  = args.app;

	NotificationListener.findUserSpecificNotificationListeners( arg, function( error, notificationListeners ){
		if ( error ){
			console.log("[NotificationListener.findUserSpecificNotificationListeners] error - " + error );
			callback( null, new Array());
		}
		if ( null != notificationListeners ){
			var i = notificationListeners.length - 1;
			var arr = new Array();
			for (; i>=0; i-- ){
				arr.push( notificationListeners[i].uuid );
			}	
			
			var listeners = new Object();
			listeners.uuid = arr;
			if ( arr.length === 0 ){
				console.log("[NotificationListener.findUserSpecificNotificationListeners] error - There are no notification listeners for this user");
				callback( null , new Array());
				return;
			}
			UserNotification.findUserNotificationsByListenerUUID( listeners, function( error, usernotifications ){
			
				if ( error ){
					console.log("[UserNotification.findUserNotificationsByListenerUUID] error - " + error );
					callback( null, new Array());
				}
				else {
					//var notifications = new Object();
					//notifications.usernotifications = usernotifications;
					var userWithNotifications = new Array();
					async.forEachSeries( usernotifications, function( usernotification, callback ){
						var tempObj = new Object();
						require('../models/user.js').User.find({ where : { uuid : usernotification.origin}}).success(function( foundUser ){
							NotificationListenerImpl.find({ where : { uuid : usernotification.listener}}).success(function( notificationListener) {
								UserProfileImpl.find({ where : { user : foundUser.uuid }}).success(function( userProfile){
									tempObj.profile = userProfile;
									tempObj.notificationListener = notificationListener;
								    tempObj.notification = usernotification;
								    tempObj.user         = foundUser;
								    userWithNotifications.push( tempObj );
								    callback( null, tempObj );
								}).error( function ( error) {
									console.log("[UserProfileImpl.find] error - "+error);
									callback( null, new Object());
								});
								
							}).error(function(error){
								console.log("[NotificationListenerImpl.find] error - "+ error );
								callback( null, new Object());
							});
							
						}).error( function ( error ){
							console.log("[User.find] error - "+ error );
							callback( error, new Object());
						}); 
					
					}, function ( error , results ){
						if ( error ){
							console.log("[NotificationAction.removeUserNotificationsByUser] error - "+error);
							callback( null , new Array());
						}
						else {
							callback( null, userWithNotifications );
						}
					});
				}
			});
		}
	});
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
		console.log("[NotificationAction.removeNotifier] error - Args is not existent");
		callback( null, new Array());
		return;
	}
	
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('event') &&
		                               args.hasOwnProperty('app'));
		                            
	if ( !containsAllProperties ){
		console.log("[NotificationAction.removeNotifier] error - Invalid args");
		callback( null, new Array());
	}
	
	var arg = new Object();
	arg.user = args.user;
	arg.target = args.target;
	arg.event = args.event;
	arg.app = args.app;
	
	NotificationListener.findNotificationListener( arg, function( error, notificationListener ){
		if ( error ){
			console.log("[NotificationListener.findNotificationListener] error - " + error );
			callback( null, new Object() );
			return;
		}
		if ( null === notificationListener ){
			console.log("[NotificationListener.findNotificationListener] error - notificationListener is null");
			callback( null, new Object());
			return;
		}
		arg.notificationlistener = notificationListener;
		NotificationListener.removeNotificationListener( arg, function( error, removedListener ){
			if ( error ){
				callback( error, null );
				return;
			}
			if (  null === removedListener ) {
				console.log("[NotificationListener.findNotificationListener] error - no listener was removed");
				callback( null, new Array());
				return;
			}
			arg.listener = arg.notificationlistener.uuid;
			UserNotification.selectUserNotifications( arg, function( error, userNotifications ){
				if ( error ){
					console.log("[NotificationListener.selectUserNotifications] error - "+error);
					callback( null, new Array());
					return;
				}
				if ( 0 === userNotifications.length ){
					console.log("[NotificationListener.findNotificationListener] error - no user notifications were found matching your parameters");
					callback( null, new Array());
					return;
				}
				arg.usernotifications = userNotifications;
				UserNotification.removeUserNotifications( arg, function( error, removedUserNotifications){
					if ( error ){
						console.log("[NotificationListener.removeUserNotifications] error - "+error);
						callback( null, new Array());
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
		console.log("[NotificationAction.addNotifier] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('event') &&
		                               args.hasOwnProperty('app'));
		                            
	if (!containsAllProperties ){
		console.log("[NotificationAction.addNotifier] error - Invalid args");
		callback( null, new Object());
		return;
	}
	
	var arg    = new Object();
	arg.user   = args.user;
	arg.target = args.target;
	arg.event  = args.event;
	arg.app    = args.app;

	NotificationListener.findNotificationListener( arg, function(error, listener){
		if ( error ){
			console.log("[NotificationAction.findNotificationListener] error - "+error);
			callback( null , new Object() );
			return;
		}
		if ( null === listener ){
			NotificationListener.createNotificationListener(arg, function(error, newListener){
				if ( error ){
					console.log("[NotificationAction.createNotificationListener] error - "+error);
					callback( null , new Object() );
					return;
				}
				if ( null == newListener ){
					console.log("[NotificationAction.createNotificationListener] error - no listener created");
					callback( null, new Object());
					return;
				}
				// if we had o create a new listener
				callback( null, newListener );
			});
		} else {
		    // if a notification listener already exists which matches the one the user wanted to create
			callback( null, listener );
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
		console.log("[NotificationAction.compileEmail] error - Args is not existent");
		callback( null, new Object() );
		return;
	}
	var containsAllProperties = ( args.hasOwnProperty('user')        &&
	                              args.hasOwnProperty('description') &&
		                               args.hasOwnProperty('wait'));
		                            
	if ( !containsAllProperties ){
		console.log("[NotificationAction.compileEmail] error - Invalid args");
		callback( null , new Object() );
		return;
	}
	
	if ( 0 != args.wait ){
	    // it isnt an error if we get out early
		callback(null, new Object());
		return;
	}
	
	var msg = args;

	require('../models/user.js').User.find({ where: { uuid: msg.user}}).success( function( userFound ){
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
		 			console.log("[NotificationAction.compileEmail] error - "+err);
		 			callback( null, new Object());
		 		} else {
		 			callback( null, message );
		 		}
		  	});
		}
		else {
			console.log("[NotificationAction.compileEmail] error - user doesnt exist");
			callback( null, new Object() );
		}
	}).error(function(error){
		console.log("[NotificationAction.compileEmail] error - "+error);
		callback( null, new Object());
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
		console.log("[NotificationAction.addLikeNotifier] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if ( !containsAllProperties ){
		console.log("[NotificationAction.addLikeNotifier] error - Invalid args");
		callback( null, new Object());
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
		console.log("[NotificationAction.addCommentNotifier] error - Args is not existent");
		callback( null , new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (!containsAllProperties ){
		console.log("[NotificationAction.addCommentNotifier] error - Invalid args");
		callback( null, new Object());
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
		console.log("[NotificationAction.addStarNotifier] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (   args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if ( !containsAllProperties ){
		console.log("[NotificationAction.addStarNotifier] error - Invalid args");
		callback( null, new Object());
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
		console.log("[NotificationAction.addNewResourceNotifier] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		console.log("[NotificationAction.addNewResourceNotifier] error - Invalid args");
		callback( null, new Object());
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
		console.log("[NotificationAction.removeLikeNotifier] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		console.log("[NotificationAction.removeLikeNotifier] error - Invalid args");
		callback( null, new Object());
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
		console.log("[NotificationAction.removeCommentNotifier] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user')   &&
	                             args.hasOwnProperty('target') &&
		                         args.hasOwnProperty('app'));                       
	if ( !containsAllProperties ){
		console.log("[NotificationAction.removeCommentNotifier] error - Invalid args");
		callback( null, new Object());
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
		console.log("[NotificationAction.removeStarNotifier] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		console.log("[NotificationAction.removeStarNotifier] error - Invalid args");
		callback( null, new Object());
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
		console.log("[NotificationAction.removeNewResourceNotifier] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (  !containsAllProperties ){
		console.log("[NotificationAction.removeNewResourceNotifier] error - Invalid args");
		callback( null, new Object());
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
		console.log("[NotificationAction.createNewResource] error - Args is not existent");
		callback( null, new Array());
		return;
	}
	
	var containsAllProperties = (args.hasOwnProperty('user') &&
	                              args.hasOwnProperty('target') &&
		                               args.hasOwnProperty('app'));
		                            
	if (!containsAllProperties ){
		console.log("[NotificationAction.createNewResource] error - Invalid args");
		callback( null, new Array());
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
		if (error ) {
			console.log("[NotificationAction.createNewResource] error - invalid like listener");
			callback( null, new Array());
			return;
		}
		arg.event = 1;
		notificationArray.push( likeListener );
		self.addNotifier( arg, function( error, commentListener){
			if (error ) {
				console.log("[NotificationAction.createNewResource] error - invalid comment listener");
				callback( null, new Array());
				return;
			}
			arg.event = 2;
			notificationArray.push(commentListener );
			self.addNotifier( arg, function( error, starListener){
				if (error ) {
					console.log("[NotificationAction.createNewResource] error - invalid star listener");
					callback( null, new Array());
					return;
				}
				notificationArray.push( starListener );
				if ( notificationArray.length == 3 ){
					callback( null, notificationArray );
				} else {
					console.log("[NotificationAction.createNewResource] error - " + error);
					callback( null, new Array());
				}
			});
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
		console.log("[NotificationAction.createNewQuestion] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('app') &&
	                              args.hasOwnProperty('user') &&
		                               args.hasOwnProperty('target'));
		                            
	if (  !containsAllProperties ){
		console.log("[NotificationAction.createNewQuestion] error - Invalid args");
		callback( null, new Object());
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
		console.log("[NotificationAction.setupCourseMaterialNotifiers] error - Args is not existent");
		callback( null, new Array());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('app') &&
	                              args.hasOwnProperty('target'));
		                            
	if (  !containsAllProperties ){
		console.log("[NotificationAction.setupCourseMaterialNotifiers] error - Invalid args");
		callback( null, new Array());
		return;
	}
	var self = this;
	Course.getCourseMembers( args.target , function( err, studentsInCourse ){
		var i = studentsInCourse.length - 1;
		var students = new Array();
		var addedStudents = new Array();
		for(; i >= 0; i-- ){
			var arg = new Object();
			arg.target = args.target;
			arg.user = studentsInCourse[i].userID;
			arg.app  = args.app;
			students.push( arg );
		}
		async.forEachSeries( students, function( student, callback){
			self.addNewResourceNotifier( student, function( error, data ){
				if ( error ){
					console.log("[NotificationAction.setupCourseMaterialNotifiers] error - "+error);
					callback( null, new Array());
					return;
				} else {
					addedStudents.push( data );
					callback(null, data );
				}
			});
		
	    }, function(err, results){
			if ( err ) {
				console.log("[NotificationAction.setupCourseMaterialNotifiers] error - "+error);
				callback( null, new Array() );
			}else {
				callback( null, addedStudents );
			}
	     } );
	});
}

/*
To add a user notification when a resource has been liked

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	description : The message to be delivered in the notification	
	origin      : UUID of the user that caused this user notification
}
*/
NotificationAction.prototype.addLikeUserNotification = function( args, callback){
	
	if ( args === null || args === undefined ){
		console.log("[NotificationAction.addLikeUserNotification] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('target') &&
	                              args.hasOwnProperty('app') &&
		                           args.hasOwnProperty('description') &&
		                           args.hasOwnProperty('origin')
		                        );
	if ( !containsAllProperties ){
		console.log("[NotificationAction.addLikeUserNotification] error - Invalid args");
		callback( null, new Object());
		return;
	}
	var arg = new Object();
	arg.target = args.target;
	arg.app = args.app;
	arg.description = args.description;
	arg.event = 0;
	arg.origin = args.origin;
	
	
	this.addUserNotification(arg,callback);
}

/*
To add a user notification when a resource has been commented on

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	description : The message to be delivered in the notification	
	origin      : UUID of the user that caused this user notification
}
*/
NotificationAction.prototype.addCommentUserNotification = function( args, callback){
	if ( args === null || args === undefined ){
		console.log("[NotificationAction.addCommentUserNotification] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('target') &&
	                              args.hasOwnProperty('app') &&
		                           args.hasOwnProperty('description') &&
		                           args.hasOwnProperty('origin')
		                           );
		                            
	if ( !containsAllProperties ){
		console.log("[NotificationAction.addCommentUserNotification] error - Invalid args");
		callback( null, new Object());
		return;
	}
	
	var arg = new Object();
	arg.target = args.target;
	arg.app = args.app;
	arg.description = args.description;
	arg.event = 1;
	arg.origin = args.origin;
	
	this.addUserNotification(arg,callback);
}

/*
To add a user notification when a resource has been starred

args = {
	target      : <the resource, tag, question>
	app         : <the application eg. Accent, Engage, QRQA>
	description : The message to be delivered in the notification	
	origin      : UUID of the user that caused this user notification
}
*/
NotificationAction.prototype.addStarUserNotification = function( args, callback){
	if ( args === null || args === undefined ){
		console.log("[NotificationAction.addStarUserNotification] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('target') &&
	                              args.hasOwnProperty('app') &&
		                           args.hasOwnProperty('description') &&
		                           args.hasOwnProperty('origin')
		                           );
		                            
	if ( !containsAllProperties ){
		console.log("[NotificationAction.addStarUserNotification] error - Invalid args");
		callback( null, new Object());
		return;
	}
	
	var arg = new Object();
	arg.target = args.target;
	arg.app = args.app;
	arg.description = args.description;
	arg.event = 2;
	arg.origin = args.origin;
	
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
		console.log("[NotificationAction.addNewResourceUserNotification] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('target') &&
	                              args.hasOwnProperty('app') &&
		                           args.hasOwnProperty('description') &&
		                           args.hasOwnProperty('origin')
		                           );
		                            
	if (  !containsAllProperties ){
		console.log("[NotificationAction.addNewResourceUserNotification] error - Invalid args");
		callback( null, new Object());
		return;
	}
	
	var arg = new Object();
	arg.target = args.target;
	arg.app = args.app;
	arg.description = args.description;
	arg.event = 3;
	arg.origin = args.origin;
	
	this.addUserNotification(arg,callback);
}


/*
	To update the settings for specific users to get certain types of notifications
	
	args = {
		user                      : id of the user
		app                       : id of the app
		notificationOnNewResource : 0 - 3 , time to send
		notificationOnLike      : 0 - 3 , time to send
		notificationOnComment   : 0 - 3, time to send
		notificationOnStar      : 0 - 3 , time to send
	}
	
	Returns the newly updated user notification settings 
*/
NotificationAction.prototype.updateUserNotificationSettings = function( args, callback){
	if ( args === null || args === undefined ){
		console.log("[NotificationAction.updateUserNotificationSettings] error - Args is not existent");
		callback( null, new Object());
		return;
	}
	var containsAllProperties = (
								  args.hasOwnProperty('user') &&
								  args.hasOwnProperty('app') &&
	                              args.hasOwnProperty('notificationOnNewResource') &&
	                              args.hasOwnProperty('notificationOnLike') &&
	                              args.hasOwnProperty('notificationOnComment') &&
	                              args.hasOwnProperty('notificationOnStar') );               
	if ( !containsAllProperties ){
		console.log("[NotificationAction.updateUserNotificationSettings] error - Invalid args");
		callback( null, new Object());
		return;
	}
	
	var arg = new Object();
	arg.app                       = args.app;
	arg.user                      = args.user;
	arg.notificationOnNewResource = args.notificationOnNewResource;
	arg.notificationOnLike        = args.notificationOnLike;
	arg.notificationOnComment     = args.notificationOnComment;
	arg.notificationOnStar        = args.notificationOnStar;


	UserNotificationSettings.findNotificationSettings( arg, function( error , setting ){
		if ( error ){
			console.log("[NotificationAction.updateUserNotificationSettings] error - "+error);
			callback( null, new Object());
			return;
		}
		if ( null === setting ){
			console.log("[NotificationAction.updateUserNotificationSettings] error - No settings found");
			callback( null, new Object());
			return;
		}
		arg.usernotificationsettings = setting;
		UserNotificationSettings.updateUserNotificationSettings(arg, function( error, updatedSettings ){
			if ( error ){
				console.log("[UserNotificationSettings.updateUserNotificationSettings] error - "+error);
				callback( null, new Object());
			} else {
				callback( null, updatedSettings );
			}
		});
	});
}
/*

	To create a new set of user notification settings for a specific app for the user
	
	args = {
		app : Identifier of the application
		user : UUID of the user whose notification settings you are creating
	}	
	
	returns the created user notification settings
*/
NotificationAction.prototype.createUserNotificationSettings = function( args, callback){
	if ( args === null || args === undefined ){
		console.log("[UserNotificationSettings.createUserNotificationSettings] error - Args is not existent");
		callback( null, new Object());		
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('app') &&
	                              args.hasOwnProperty('user'));
		                            
	if ( !containsAllProperties ){
		console.log("[UserNotificationSettings.createUserNotificationSettings] error - Invalid args");
		callback( null, new Object());	
		return;
	}
	
	var arg = new Object();
	arg.app = args.app;
	arg.user = args.user;
	
	UserNotificationSettings.addNotificationSetting( arg, function( error, newSettings ){
		if( error){
			console.log("[UserNotificationSettings.addNotificationSetting] error - "+error);
			callback( null, new Object());
		}
		else {
			callback(null, newSettings);
		}
	});
}

NotificationAction.prototype.getUserNotifications = function(args, callback){
	NotificationListener.findAllNotificationListeners(args, function( error, listeners ){
		if(error){
			console.log("[NotificationAction.findAllNotificationListeners] error - "+error);
			return callback( null, new Object());
		}

		if ( null === listeners ){
			console.log("[NotificationAction.findAllNotificationListeners] error - No listeners found");
			return callback( null, new Object());
		}

		callback(null, listeners)
	});
}

module.exports = new NotificationAction;