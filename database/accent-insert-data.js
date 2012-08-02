var fs = require('fs');
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('./db-queries.js');

queries.insertData(
	'database/accent-data.json',
	config.mysqlDatabase["db-name"],
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	config.mysqlDatabase["host"]
	);