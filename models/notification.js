var fs  = require("fs");
var config = JSON.parse( fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var UserNotification = require('./userNotification.js').UserNotification;
var db = new Sequelize(
	config.mysqlDatabase["db-name"],
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"]
	}
);



var Notification = exports.Notification = db.define('Notification', {
	uuid: {type: Sequelize.STRING, primaryKey: true, unique: true },
	app : {type:Sequelize.STRING, allowNull: false},
	user : {type:Sequelize.STRING, allowNull: false},
	target: {type:Sequelize.STRING, allowNull: false},
	attribute:{ type:Sequelize.INTEGER, allowNULL: false}
});

exports.selectNotification =  function(args, callback){
	Notification.find({where: args}).success(function(notification){
		callback( null, notification);
	}).error(function(error){
		console.log("Couldn't select notification " + error );
		callback( error , null );
	});
}

exports.selectNotifications = function(args, callback){
	Notification.findAll({where: args}).success(function(notifications){
		callback( null, notifications);
	}).error(function(error){
		console.log("Couldn't select notifications " + error );
		callback( error, null );
	});
}
 
exports.addNotification = function( args, callback ){
	
	Notification.find({where: args}).success(function(notification){
		callback( null, notification);
		console.log("The notification already exists " + error );
	}).error(function(error){
		console.log("Couldn't select notification " + error );
		callback( error , null );
	});
}