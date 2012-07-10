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
		//logging: false
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
*/
exports.updateNotificationSettings = function(args, callback){
	UserNotificationSettings.find( { where: {user : args.user , app : args.app }}).success(function( notificationSettings){
	
		var arg;
		
		arg = args.motificationsOnResource; 
		if ( null != arg && contains( arg, validTimes )){
			notificationSettings.notificationOnResource = arg;
		}
		
		arg = args.notificationOnLike;
		if ( null != arg && contains( arg, validTimes )){
			notificationSettings.notificationOnLike = arg;
		}
		
		arg = args.notificationOnComment;
		if ( null != arg && contains( arg, validTimes )){
			notificationSettings.notificationOnComment = arg;
		}
		
		arg = args.notificationOnStar;
		if ( null != arg && contains( arg, validTimes )){
			notificationSettings.notificationOnStar = arg;
		}
		
		notificationSettings.save().success( function(){
			console.log(" notification settings saved for user "+args.uuid );
		});
		callback( null, notificationSettings );
	}).error(function( error) {
		console.log("Unable to update user notification settings." + error );
		callback( error, null );
	});

}