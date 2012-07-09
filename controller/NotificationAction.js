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

NotificationAction.prototype.removeUserNotifications = function( args, callback ){ 
	Notification.find( { where : { target: args.target, attribute : args.attribute, user : args.user }})
	.success( function(notification) {
		if ( null != notification ){
			UserNotification.findAll({ where : {uuid : notification.uuid}})
				.success( function(notifications){
				var length = notifications.length;
				console.log(" There are "+ length+"  user notifications to remove");
				var i = 0;
				for ( ; i < length; i++){
					notifications[i].destroy().error( function( error ){
						console.log( error );
						callback( error, null );
					});
				}
				callback( null, notification.uuid );
			}).error( function(error){
				console.log("error with finding the user notifications");
				callback( error, null);
			})
		}else {
			console.log(" the notifier does not exist ");
		}
	});
}
NotificationAction.prototype.removeNotifier = function( args, callback){
	Notification.find( { where : args }).success( function(notification) {
		if ( null != notification ){
			notification.destroy().success( function( removedElement ){
				UserNotification.findAll({ where : {uuid : removedElement.uuid}})
					.success( function(notifications){
					var length = notifications.length;
					console.log(" There are "+ length+"  user notifications to remove");
					var i = 0;
					for ( ; i < length; i++){
						notifications[i].destroy().error( function( error ){
							console.log( error );
							callback( error, null );
						});
					}
					callback( null, removedElement );
				}).error( function(error){
					console.log("error with finding the user notifications");
					callback( error, null);
				})
			}).error( function( error ){
				console.log(" error with removed the notifier ");
				callback( error , null );
			});
		}else {
			console.log(" the notifier does not exist ");
		}
	}).error( function(error){
		console.log("error with finding the element");
		callback( error, null);
	});
}

// add notifiers to notification table
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

NotificationAction.prototype.addNotificationSetting = function( args, callback){
	var newSettings = UserNotificationSettings.build(args);
	newSettings.save().error(function(error){
		console.log("Failed to create notification setting " + error );
		callback( error, null);
	}).success(function( setting ){
		callback(null, setting );
	});
}

NotificationAction.prototype.addLikeNotifier = function( args, callback){
	args.attribute = 0;
	this.addNotifier( args, callback);
}

NotificationAction.prototype.addCommentNotifier = function( args, callback){
	args.attribute = 1;
	this.addNotifier( args, callback);
}

NotificationAction.prototype.addStarNotifier = function( args, callback){
	args.attribute = 2;
	this.addNotifier( args, callback);
}

NotificationAction.prototype.addNewResourceNotifier = function( args, callback){
	args.attribute = 3;
	this.addNotifier( args, callback);
}

NotificationAction.prototype.removeLikeNotifier = function( args, callback){
	args.attribute = 0;
	this.removeNotifier( args, callback);
}

NotificationAction.prototype.removeCommentNotifier = function( args, callback){
	args.attribute = 1;
	this.removeNotifier( args, callback);
}

NotificationAction.prototype.removeStarNotifier = function( args, callback){
	args.attribute = 2;
	this.removeNotifier( args, callback);
}

NotificationAction.prototype.removeNewResourceNotifier = function( args, callback){
	args.attribute = 3;
	this.removeNotifier( args, callback);
}

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

NotificationAction.prototype.createNewQuestion = function( args, callback ){
	this.addCommentNotifier( args, callback );
}

NotificationAction.prototype.setupCourseMaterialNotifiers = function( args, callback ){
	var self = this;
	Course.getCourseMembers( { course : args.target }, function( err, students ){
		var length = students.length;
		console.log("there are "+length+" students");
		var i = length -1;
		for(; i >= 0; i--){
			args.user = students[i].uuid;
			self.addNotifier( args, function( error, data ){
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
args = {
			user : <user uuid >
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
function compileEmail( message ){
	var msg = message;
	User.find({ where: { UUID: msg.user}}).success( function( user ){
		if ( user != null ) {
			console.log(  "@#! "+msg );
			var str = "";
			str+=("You have 1 " + msg.app + " notification!\n==================\n");
				str+=( 1+") "+ msg.description +"\n");
			
			str+=("\n\n Thanks for using our service,\n\t"+msg.app+" Mobile team\n\n");
			console.log( str );
		
			if ( !debug ) {
				var message = {
   					text:    str,
   					from:    config.emailsettings.from,
   					to:      user.firstName+ " " +user.lastName+"<"+user.email+">",
   					subject: msg.app +" notification"
		 		};
		
		 		server.send(message, function(err, message){
		 			console.log(err || message);
		  		});
		  		i = 0;
		  		
		  		msg.emailSent = true;
		  		msg.save().success( function(){
		  			console.log("notification sent");
		  		});
		  	}	
		}
	});
}

NotificationAction.prototype.addUserNotification = function( args, callback ){
	Notification.findAll({where : 
		{ app : args.app, target : args.target, attribute : args.attribute}})
			.success( function(notifications ){
		var length = notifications.length;
		var i = length-1;
		var temp = args;
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
				
				var userNotificationData = new Object();
				userNotificationData.uuid = args.uuid;
				userNotificationData.user = args.user;
				userNotificationData.app = args.app;
				userNotificationData.description = args.description;
				userNotificationData.emailSent = false;
				userNotificationData.wait = args.wait;
				var userNotification = UserNotification.build(userNotificationData);
				
				if ( args.wait == "now" ){
					compileEmail( userNotification );
				} else {
					userNotification.save().error(function(error){
						console.log("Failed to insert user notification " + error);
					})
				}
				callback( null, userNotification);
			});
		}
		
		
	});

}

var object = {
			"user":"A7S7F8GA7SD11A7SDF8ASD7G",
		    "app":"Accent",
		    "target":"B857346H7ASDFG9",
		    "attribute":2,
		    "description": "This is a test description"
  };


var notify = new NotificationAction();
notify.removeUserNotifications( object, function( err, data){
	if (data ) {
		console.log( "[SUCCESS] - "+ data);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
  