var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require("./db-queries.js");

queries.createDB(config.mysqlDatabase["db-name"]);