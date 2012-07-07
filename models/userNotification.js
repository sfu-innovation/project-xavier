var fs  = require("fs");
var config = JSON.parse( fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var db = new Sequelize(
	 config.mysqlDatabase["db-name"],
	 config.mysqlDatabase["user"],
	 config.mysqlDatabase["password"],
	
	 {
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"]
	 }
);

var UserNotification = exports.UserNotification = db.define('UserNotification', {
     uuid: {type: Sequelize.STRING, primaryKey: true, unique: true },
	 app : {type:Sequelize.STRING, allowNull: false },
	 user : {type:Sequelize.STRING, allowNull: false },
	 description: {type:Sequelize.STRING, allowNull: false },
	 emailSent: {type:Sequelize.BOOLEAN, defaultValue: false },
	 wait:{ type:Sequelize.STRING , allowNULL: false, defaultValue: "now" }
});

exports.selectUserNotification =  function(args, callback){
	UserNotification.find({where: args}).success(function(notification){
		callback( null, notification);
	}).error(function(error){
		console.log("Couldn't select user notification " + error );
		callback( error , null );
	});
}

exports.selectUserNotifications = function(args, callback){
	UserNotification.findAll({where: args}).success(function(notifications){
		callback( null, notifications);
	}).error(function(error){
		console.log("Couldn't select user notifications " + error );
		callback( error, null );
	});
}
 