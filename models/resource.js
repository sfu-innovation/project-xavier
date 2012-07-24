var EngageAction = require('../controller/EngageAction');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');
var Sequelize = require('sequelize');
var ES = require('../controller/queryES.js');
var Course = require('../models/course.js');
var async = require('async');
var User = require('../models/user.js');
var Section = require(__dirname + '/section.js');
var Star = require(__dirname + '/star.js');
var UserProfile = require(__dirname + '/userProfile.js');
var SectionMaterial = require(__dirname + '/sectionMaterial.js');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],

	{
		port:config.mysqlDatabase["port"],
		host:config.mysqlDatabase["host"]
		//logging: false
	}
);


var Resource = exports.Resource = db.define('Resource', {
	uuid:{type:Sequelize.STRING, unique:true, primaryKey:true},
	user:{type:Sequelize.STRING, allowNull:false},
	course:{type:Sequelize.STRING, allowNull:false},
	week:{type:Sequelize.INTEGER, allowNull:true}, // the number of week it belongs to
	title:{type:Sequelize.STRING, allowNull:false},
	description:{type:Sequelize.TEXT},
	resourceType:{type:Sequelize.INTEGER, allowNull:false},
	fileType:{type:Sequelize.STRING, allowNull:true},
	likes:{type:Sequelize.INTEGER, defaultValue:0},
	url:{type:Sequelize.STRING, allowNull:false} ,
	path:{type:Sequelize.STRING, allowNull:false}  ,
	author:{type:Sequelize.STRING, allowNull:true} ,
	excerpt:{type:Sequelize.TEXT, allowNull:true} ,
	thumbnail:{type:Sequelize.STRING, allowNull:true},// a preview image for resource (for engage)
	publishedDate:{type:Sequelize.STRING,allowNull:true}


});


exports.getResourceByUserId = function (args, callback) {
	Resource.findAll({where:{user:args.user}}).success(
		function (resources) {
			if (resources) {
				callback(null, resources);
			}
			else {
				callback("No Resources", null);
			}
		}).error(function (error) {
			callback(error, null);
		})
}

exports.getResourcesByCourseUUIDs = function (args, callback) {
	Resource.findAll({where:{course:args.uuids}}).success(
		function (resources) {
			if (resources) {

				callback(null, resources);
			}
			else {
				callback("No Resources", null);
			}
		}).error(function (error) {
			callback(error, null);
		})

}


//get resourceByCourseUUIDs and a range of dates
exports.getResourcesByCourseUUIDsAndDates = function (args, callback) {
	var UUIDs = "(";
	for (var i = 0; i < args.uuids.length; i++) {
		UUIDs += '"' + args.uuids[i] + '"';
		if (i != args.uuids.length - 1) {
			UUIDs += ','
		}
		else {
			UUIDs += ')'
		}
	}
	var statement = 'SELECT * FROM `Resources` WHERE createdAt >= "' + args.start + '" AND createdAt <= "' + args.end + '" AND course IN ' + UUIDs;
	//custom query
	db.query(statement, Resource).success(
		function (resources) {
			if (resources) {

				callback(null, resources);
			}
			else {
				callback("No Resources", null);
			}
		}).error(function (error) {
			callback(error, null);
		})


}


exports.getResourcesByUUIDs = function (args, callback) {
	Resource.findAll({where:{uuid:args.uuids}}).success(
		function (resources) {
			if (resources) {
				callback(null, resources);
			}
			else {
				callback("No Resources", null);
			}
		}).error(function (error) {
			callback(error, null);
		})
}

//Fetch the resource with the given UUID
exports.getResourceByUUID = function (resourceUUID, callback) {
	Resource.find({where:{uuid:resourceUUID}}).success(
		function (resource) {
			if (resource) {
				callback(null, resource);
			}
			else {
				callback("No Resource", null);
			}
		}).error(function (error) {
			callback(error, null);
		})
}


//Creates a new resources and saves it to the database
//userUUID is the uuid of the user submitting the resource
exports.createResource = function (userUUID, args, callback) {
	var User = require(__dirname + '/user.js');
	args.user = userUUID;
	args.uuid = UUID.generate();
	User.getUserCourses(userUUID, function (error, courses) {
		var isCourseMember = false;
		if (error) {
			callback(error, null);
		}

		if (courses.length === 0) {
			callback("Can't create resource.  No courses found for user.", null);
		}

		for (index in courses) {
			if (args.course === courses[index].uuid) {
				isCourseMember = true;
			}
		}

		if (isCourseMember) {
			Resource.create(args).success(
				function (resource) {
					callback(null, resource);
				}).error(function (error) {
					console.log("can't create resource " + error);
					callback(error, null);
				});
		}
		else {
			callback("You can't create a resource for a course you aren't enrolled in", null);
		}
	});
}

//Deletes the resource with the given uuid
exports.deleteResource = function (resourceUUID, callback) {
	Resource.find({where:{uuid:resourceUUID}}).success(function (resource) {
		if (resource) {
			resource.destroy().success(
				function (result) {
					callback(null, result);
				}).error(function (error) {
					callback(error, null);
				})
		}
		else {
			callback("That resource doesn't exist!", null);
		}
	})
}

//Gets the number of likes for the course with the given uuid
exports.getLikesByUUID = function (resourceUUID, callback) {
	Resource.find({where:{uuid:resourceUUID}}).success(
		function (resource) {
			if (resource) {
				callback(null, resource.likes);
			}
			else {
				callback("No resource found", null);
			}
		}).error(function (error) {
			callback(error, null);
		})
}


