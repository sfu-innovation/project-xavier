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

var Section = exports.Section = db.define('Section', {
	uuid: {type: Sequelize.STRING, allowNull: false},
	title: {type: Sequelize.STRING, allowNull: false},
	app  : {type: Sequelize.INTEGER, allowNull: false}
});

