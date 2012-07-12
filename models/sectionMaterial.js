var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
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

var SectionMaterial = exports.SectionMaterial = db.define('SectionMaterial', {
	section: {type: Sequelize.STRING, allowNull: false},
	material: {type: Sequelize.STRING, allowNull: false},
});
