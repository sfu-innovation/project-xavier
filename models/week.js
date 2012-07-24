var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var UUID = require('com.izaakschroeder.uuid');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"]
	}
);

var Week = exports.Week = db.define('Week', {
	uuid: {type: Sequelize.STRING, allowNull: false,  primaryKey: true},
	course : {type: Sequelize.STRING, allowNull: false}, //uuid of the course
	week: {type: Sequelize.INTEGER, allowNull: false},  //number of the week , ex 1
	topic : {type: Sequelize.TEXT,allowNull: true},   // a topic that will be setted by the prof
	app  : {type: Sequelize.INTEGER, allowNull: false}  //app type , not sure if needed
});


exports.selectWeek = function(args, callback){
	Week.find({where: args}).success(function(tag) {
		callback(null, week);
	}).error(function(error) {
			callback(error, null);
			console.log("Couldn't find week " + error);
		});
}


exports.updateWeek = function(uuid, args, callback){
	Week.find({where: {uuid: uuid}}).success(function(week) {
		tag.updateAttributes(args).success(function(updatedWeek) {
			callback(null, updatedWeek);
		});
	}).error(function(error) {
			callback(error, null);
			console.log("Couldn't find week " + error);
		});
}