var fs  = require("fs");
var config = JSON.parse( fs.readFileSync("config.json"));
var Sequalize = require('sequelize');
var db = new Sequelize(
	 config.mysqlDatabase["db-name"]
	,config.mysqlDatabase["user"]
	,config.mysqlDatabase["password"]
	, {
		 host: config.mysqlDatabase["host"]
	 }
);

var Notification = exports.Notification = db.define('Notification'.{
	  uuid: {type: Sequelize.STRING, primaryKey: true }
	, user : {type:Sequelize.STRING, allowNull: false}
	, app : {type:Sequelize.STRING, allowNull: false}
	, description : {type: Sequelize.STRING, allowNull: false}
	, batch : {type: Sequelize.STRING, allowNull: false}
	, emailed : {type: Sequelize.BOOLEAN, allowNull: false}
});

exports.selectNotification =  function(args, callback){
	Notification.find{(where: args}.success(function(notification){
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
 