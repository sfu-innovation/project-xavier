var fs = require("fs")
var config = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var Resource = require(__dirname + '/resource.js').Resource;
var ES = require('../controller/queryES.js');
var Course = require('../models/course.js');
var async = require('async');
var User = require('../models/user.js');
var Section = require(__dirname + '/section.js')
var SectionMaterial = require(__dirname + '/sectionMaterial.js');

var db = new Sequelize(
	config.mysqlDatabase["db-name"],
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],

	{
		port:config.mysqlDatabase["port"],
		host:config.mysqlDatabase["host"]
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
						callback(null, star);
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

exports.getStarredResources = function (userUUID, callback) {
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
				Resource.findAll({where:{uuid:resourceUUIDs}}).success(
					function (resources) {
						var parsedResult;
						async.series({
							findCourseInfo:function (callback) {
								async.forEach(resources, function (resource, callback) {
									Course.selectCourse({'uuid':resource.course}, function (error, course) {
										if (course) {
											resource.course = course;
										}
										callback();
									})

								}, function (err) {
									callback(err)
								})

							},

							findUserInfo:function (callback) {
								async.forEach(resources, function (resource, callback) {

										User.selectUser({"uuid":resource.user}, function (error, user) {
											if (user) {
												resource.user = user;
											}
											callback();
										});
									},
									function (err) {

										callback(err)
									})


							},

							findSectionId:function (callback) {
								parsedResult = JSON.parse(JSON.stringify(resources));
								async.forEach(parsedResult , function (resource, callback) {

										SectionMaterial.findSectionIdByMaterialId({"material":resource.uuid}, function (err, result) {
											if (result) {
												resource.section = result.section;
											}
											callback(err);
										});
									},
									function (err) {

										callback(err)
									})

							},

							findSectionInfo:function (callback){
								async.forEach(parsedResult , function (resource, callback) {

										Section.findSectionById({"uuid":resource.section}, function (err, result) {
											if (result) {

												resource.section = result;
											}
											callback(err);
										});
									},
									function (err) {
										callback(err)
									})

							},

							// notice we cannot directly attach to json a totalcomments because it's a squalize object
							// so we need to stringfy first then parse....so hacky...

							findTotalComments:function (callback) {


								async.forEach(parsedResult, function (resource, callback) {
										ES.getCommentCount(2, resource.uuid, function (err, result) {

											resource.totalComments = result;


											callback();
										})
									}
									, function (err) {
										callback(err)
									})
							}


						}, function(err){


							callback(null, parsedResult);

						}) ;



//
					}).error(function (error) {
						callback(error, null);
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