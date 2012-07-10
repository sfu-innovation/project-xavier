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
	}
);

var MediaFile = exports.MediaFile = db.define('MediaFile', {
	user_uid: {type: Sequelize.STRING, primaryKey: true},	
	title: {type: Sequelize.STRING, allowNull: false},
	path: {type: Sequelize.STRING, allowNull: false},	
	type: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0}	
});

//Saves media file to database
//MediaFile gets passed in as a JSON object
exports.createMediaFile = function(media, callback){
	media.uuid = UUID.generate();
	var newMediaFile = MediaFile.build(media);
	newMediaFile.save().error(function(error){
		callback(error, null);
	}).success(function(){
		callback(null, newMediaFile);
	})
}