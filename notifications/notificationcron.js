
var UserNotification = require('../models/userNotification.js').UserNotification;
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

console.log( process.argv );
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
function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return i;
       }
    }
    return -1;
}
var visible_apps = ["RQRA", "Accent", "Engage"];
var apps = [ 0, 1, 2];

function compileEmail( arr ){
	User.find({ where: { UUID: arr[0].user}}).success( function( user ){
		if ( user != null ) {
			var i = 0;
			var str = "";
			str+=("You have "+arr.length+ " " + visible_apps[arr[0].app] + " notification(s)\n==================\n");
			for (; i < arr.length; i++){
				str+=( i+") "+arr[i].description +"\n");
			}
			str+=("\n\n Thanks for using our service,\n\t"+visible_apps[arr[0].app] +" team\n\n");
			console.log( str );
		
			if ( !debug ) {
				var message = {
   					text:    str,
   					from:    config.emailsettings.from,
   					to:      user.firstName+ " " +user.lastName+"<"+user.email+">",
   					subject: arr[0].app + " : end of "+arr[0].wait+ " notification(s)"
		 		};
		
		 		server.send(message, function(err, message){
		 			console.log(err || message);
		  		});
		  		i = 0;
		  		for (; i < arr.length; i++){
		  			arr[i].emailSent = true;
		  			arr[i].save().success( function(){
		  				console.log("notification sent");
		  			});
		  		}
		  	}
		  	
		  	
		}
		
	});
	
}

function notifications( appType, waitTime ){
	UserNotification.findAll( {where: { app:appType, emailSent: 0, wait:waitTime}}).success( function( notifications){
		if ( notifications ){
			var dataLength = 0;
			var data = new Array();
			var users = new Array();
			var length = notifications.length;
			var i = 0;
			for (; i < length; i++){
				var s = notifications[i].user;
				var index = contains( users, s );
				if ( index === -1 ){
					users.push( s);
					data.push(new Array());
					data[dataLength++].push(notifications[i]);
				} else {
					data[index].push(notifications[i]);	
				}
			}
			for ( i = 0; i < data.length; i++){
				compileEmail( data[i] );
			}
		}
	});
}

var i = 0;
for( ; i < apps.length; i++){
	notifications( apps[i], waitTime);
}
