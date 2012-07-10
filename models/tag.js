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

var Tag = exports.Tag = db.define('Tag', {
	user_uid: {type: Sequelize.STRING, primaryKey: true},	
	start: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},	
	end: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},	
	category: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},	
	type: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
	target_uuid: {type: Sequelize.STRING}	
});

//Saves tag to database
//Tag gets passed in as a JSON object
exports.createTag = function(tag, callback){
	tag.uuid = UUID.generate();
	var newTag = Tag.build(tag);
	newTag.save().error(function(error){
		callback(error, null);
	}).success(function(){
		callback(null, newTag);
	})
}