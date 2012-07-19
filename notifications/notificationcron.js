
var UserNotification = require('../models/userNotification.js').UserNotification;
var NotificationListener = require('../models/notificationListener.js').NotificationListener;
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
		
var debug = false;

//console.log( process.argv );
if ( process.argv.length < 3 ){
	console.log( "[usage] node notifications/notificationcron.js "
	+"--day | --week | --month");
}
var flag = process.argv[2];
var waitTime;
switch( flag ){
	case "--day" :
		waitTime = 1;
		break;
	case "--week" :
		waitTime = 2;
		break;
	case "--month" :
		var waitTime = 3;
		break;
	default :
		console.log(' not a valid time :( '+flag);
		return 1;
}

//associateUsersToNotifications(notificationsFromUserNotifications( waitTime ));


notificationsFromUserNotifications( waitTime, function( error, args ){
	associateUsersToNotifications( args, function( error, args ){
	
	}); 
});

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return i;
       }
    }
    return -1;
}

function containsAppAndUser(a, obj){
	var i = a.length;
	while( i--){
		if (a[i].user === obj.user && a[i].app === obj.app ){
			return i;
		}
	}
	return -1;
}
var visible_apps = ["RQRA", "Accent", "Engage"];
var apps = [ 0, 1, 2];

function compileEmail( userObj, notifications ){
	User.find({ where: { UUID: userObj.user}}).success( function( user ){
		if ( user != null ) {
			var i = 0;
			var str = "";
			var index = 1;
			str+=("You have "+ notifications.length + " " + visible_apps[userObj.app] + " notification(s)\n==================\n");
			for (; i < notifications.length; i++){
				var j = notifications[i].length - 1;
				for(;  j >= 0; j--){
					str+=( index+") "+notifications[i][j].description +"\n");
					index++;
				}
				
			}
			str+=("\n\n Thanks for using our service,\n\t"+visible_apps[userObj.app] +" team\n\n");
			console.log( str );
		
			if ( !debug ) {
				var message = {
   					text:    str,
   					from:    config.emailsettings.from,
   					to:      user.firstName+ " " +user.lastName+"<"+user.email+">",
   					subject: userObj.app + " : end of "+visible_apps[waitTime]+ " notification(s)"
		 		};
		
		 		server.send(message, function(err, message){
		 			console.log(err || message);
		  		});
		  		i = 0;
		  		for (; i < notifications.length; i++){
		  			notifications[i].emailSent = true;
		  		}
		  	}
		  	
		  	
		}
		
	});
	
}
function associateUsersToNotifications( arg, callback ){
	if( arg === undefined || arg === null){
		return;
	}
	if ( arg.listeners === null || arg.data === null ){
		console.log(" One of the require attributes or the arg is null ");
		return;
	}
	
	// we use a common index to associate between the notifications and the listeners
	var listeners = arg.listeners;
	var data      = arg.data;
	
	// we use the same index to associate these two arrays
	var users     = new Array();
	var notifications = new Array();
	
	var currentIndex = 0;
	NotificationListener.findAll().success(function(  notificationListeners) {
		var i  = notificationListeners.length - 1;
		for(; i >= 0; i--){ // going through all of the possible notification listeners
			var listenerIndexFound = contains( listeners, notificationListeners[i].uuid );
			if ( listenerIndexFound != -1 ){ // we are on a listener that has notifications
			// we need to check to see if the users array has this element if not, add
				var indexOfUser = containsAppAndUser( users, notificationListeners[i]);
				if ( indexOfUser != -1 ){
					notifications[indexOfUser].push(data[listenerIndexFound]);
				} else {
					users.push({
						user : notificationListeners[i].user,
						app  : notificationListeners[i].app
					});
					notifications[currentIndex] = new Array();
					notifications[currentIndex++].push( data[listenerIndexFound]);
				}
			}
		}
		
		i = users.length - 1;
		for(; i>= 0; i--){
		//	console.log("************\n");
		//	console.log( notifications[i]);
			compileEmail( users[i], notifications[i]);
		}
		callback(null, null );
		//compileEmail( emails );
	}).error(function(error){
		callback(error,null);
	});
}
function notificationsFromUserNotifications( waitTime, callback ){
	UserNotification.findAll( {where: { emailSent: false, wait:waitTime}}).success( function( notifications){
		if ( notifications ){
			var dataLength = 0;
			var data = new Array();
			var listeners = new Array();
			var length = notifications.length;
			var i = 0;
			for (; i < length; i++){
				var s = notifications[i].listener;
				var index = contains( listeners, s );
				if ( index === -1 ){
					listeners.push( s);
					data.push(new Array());
					data[dataLength++].push(notifications[i]);
				} else {
					data[index].push(notifications[i]);	
				}
			}
			var arg = new Object();
			arg.data = data;
			arg.listeners = listeners;
			//return arg;
			callback( null, arg );	
		}else {
			callback( null, null);
		}
	}).error(function(error){
		callback( error, null);
		//return null;
	});
}
