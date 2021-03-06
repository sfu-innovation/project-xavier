var fs = require("fs")
var config = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var Resource = require(__dirname + '/resource.js');
var ES = require('../controller/queryES.js');
var Course = require('../models/course.js');
var async = require('async');
var User = require('../models/user.js');
var Section = require(__dirname + '/section.js')
var SectionMaterial = require(__dirname + '/sectionMaterial.js');
var Notification = require(__dirname + '/../controller/NotificationAction.js');

var db = new Sequelize(
	config.mysqlDatabase["db-name"],
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],

	{
		port:config.mysqlDatabase["port"],
		host:config.mysqlDatabase["host"],
		logging: false
	}
);


var Star = exports.Star = db.define('Star', {
	user:{type:Sequelize.STRING, allowNull:false},
	resource:{type:Sequelize.STRING, allowNull:false}
});

exports.starResource = function (userUUID, resourceUUID, callback) {
	Star.find({where:{user:userUUID, resource:resourceUUID}}).success(
		function (star) {
			if (star) {
				callback("You have already starred this resource", null);
			}
			else {
				Star.create({user:userUUID, resource:resourceUUID}).success(
					function (star) {

						if (star){
							callback(null,star);
						}
else{
							callback("failed creating a star", null);
						}

// Engage drop the requirement for notification in stars.

// uncomment this if you need it;


//						var args = {
//							user : userUUID,
//							target : resourceUUID,
//							app    :2,
//							origin: userUUID,
//							description: "someone shared your article"
//						}
//						Notification.addStarUserNotification(args, function(error){
//							if(error)
//								console.log('addStarUserNotification Failed' + error);
//
//							Notification.addStarNotifier(args, function(error){
//								if(error){
//									console.log('addStarNotifier Failed' + error);
//								}
////									return callback(error);
//
////								callback(null, star);
//							})
//
//						})


					}).error(function (error) {
						callback(error, null);
					})
			}
		}).error(function (error) {
			callback(error, null);
		})
}


exports.unstarResource = function (userUUID, resourceUUID, callback) {
	Star.find({where:{user:userUUID, resource:resourceUUID}}).success(
		function (star) {
			if (star) {
				star.destroy().success(
					function (result) {
						callback(null, result);
					}).error(function (error) {
						callback(error, null);
					})
			}
			else {
				callback("No star for that resource", null);
			}
		}).error(function (error) {
			callback(error, null);
		})
}

// determine if a resource is stared by user
//args{
//	user:    user uuid
//	resource:         resource uuid
//}

exports.isResourceStarred = function(args,callback){
	Star.find({where:{user:args.user, resource:args.resource}}).success(function(result){
				callback(null,result);






	}).error(function(error){callback(error, null);});

}

exports.getStarredResources = function (userUUID, callback) {
	console.log(userUUID);
	Star.findAll({where:{user:userUUID}}).success(
		function (resources) {
			var resourceUUIDs = null;
			if (resources.length > 0) {
				resourceUUIDs = [];
				for (index in resources) {
					resourceUUIDs.push(resources[index].resource);
				}
			}
			if (resourceUUIDs) {
				Resource.getResourcesByUUIDs({uuids:resourceUUIDs},function(err,resources){
					callback(null,resources);
				})

			}
			else {
				callback("No starred resources found", null);
			}
		}
	).
		error(function (error) {
			callback(error, null);
		})
}