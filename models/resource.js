var fs = require('fs');
var config = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');
var Sequelize = require('sequelize');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"]
		//logging: false
	}
);


var Resource = exports.Resource = db.define('Resource', {
	uuid: {type: Sequelize.STRING, primaryKey: true}
	, user: {type: Sequelize.STRING}
	, title: {type: Sequelize.STRING, allowNull: false}
	, description:  {type: Sequelize.TEXT}
	, resourceType: {type: Sequelize.INTEGER, allowNull: false}
	, fileType: {type: Sequelize.STRING, allowNull: true}
	, url: {type: Sequelize.STRING, allowNull: false}
});


exports.createResource = function(userUUID, args, callback){
	args.user = userUUID;
	args.uuid = UUID.generate();
	Resource.create(args).success(function(resource){
		callback(null, resource);
	}).error(function(error){
		console.log("can't create resource " + error);
		callback(error, null);
	});
}