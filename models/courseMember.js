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

var CourseMember = exports.CourseMember = db.define('CourseMember', {
	course: {type: Sequelize.STRING, allowNull: false},
	user: {type: Sequelize.STRING, allowNull: false}
});

