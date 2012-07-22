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
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"]
		//logging: false
	}
);



var Resource = exports.Resource = db.define('Resource', {
	uuid: {type: Sequelize.STRING, unique: true, primaryKey: true}
	, user: {type: Sequelize.STRING, allowNull: false}
	, course: {type: Sequelize.STRING, allowNull: false}
	, title: {type: Sequelize.STRING, allowNull: false}
	, description:  {type: Sequelize.TEXT}
	, resourceType: {type: Sequelize.INTEGER, allowNull: false}
	, fileType: {type: Sequelize.STRING, allowNull: true}
	, likes: {type: Sequelize.INTEGER, defaultValue: 0}
	, url: {type: Sequelize.STRING, allowNull: false}   // this is the url of the original page (for engage)
	, path: {type: Sequelize.STRING, allowNull: false}  // this is the file path of the html page we parsed (for engage)
	, author : {type: Sequelize.STRING, allowNull: true} //this is the original author of the article (for engage)
	, publishedDate : {type: Sequelize.STRING, allowNull: true} //this is the original published date of the article (for engage)
	, excerpt : {type: Sequelize.TEXT, allowNull:true} // A short extract from a film, broadcast, or piece of music or writing. (for engage)
	, thumbnail : {type: Sequelize.STRING, allowNull:true} // a preview image for resource (for engage)


});



exports.getResourceByUserId = function (args, callback){
	Resource.findAll({where:{user:args.user}}).success(function(resources){
		if(resources){
			callback(null, resources);
		}
		else{
			callback("No Resources", null);
		}
	}).error(function(error){
			callback(error, null);
		})
}

exports.getResourcesByCourseUUIDs = function(args, callback){
	Resource.findAll({where:{course:args.uuids}}).success(function(resources){
		if(resources){

			callback(null, resources);
		}
		else{
			callback("No Resources", null);
		}
	}).error(function(error){
			callback(error, null);
		})

}

exports.getResourcesByCourseUUIDsAndWeek = function (args,callback){
	var week = weekHelper(args.week);   //get the range of the requested week

	// generating the IN clause, i can't not find a syntax to do this complex query
	var UUIDs = "(";
	for (var i = 0; i<args.uuids.length;i++){
		UUIDs += '"'+args.uuids[i]+'"';
		if (i != args.uuids.length - 1){
			UUIDs += ','
		}
		else {
			UUIDs += ')'
		}

	}

	var statement = 'SELECT * FROM `Resources` WHERE createdAt >= "'+ week.start + '" AND createdAt <= "'+week.end+'" AND course IN '+ UUIDs;

	//custom query
	db.query(statement, Resource).success(function(resources){
		if(resources){

			callback(null, resources);
		}
		else{
			callback("No Resources", null);
		}
	}).error(function(error){
			callback(error, null);
		})


}


exports.getResourcesByUUIDs = function (args, callback){
	Resource.findAll({where:{uuid:args.uuids}}).success(function(resources){
		if(resources){
			callback(null, resources);
		}
		else{
			callback("No Resources", null);
		}
	}).error(function(error){
			callback(error, null);
		})
}

//Fetch the resource with the given UUID
exports.getResourceByUUID = function(resourceUUID, callback){
	Resource.find({where:{uuid:resourceUUID}}).success(function(resource){
		if(resource){
			callback(null, resource);
		}
		else{
			callback("No Resource", null);
		}
	}).error(function(error){
		callback(error, null);
	})
}

// To be deprecated
/*
//Fetch the list of resources with the given course UUID
exports.getResourceByCourseUUID = function(args, callback){
	var async = require('async');
	var CourseSection = require('./courseSection.js');

	var resources = [];	

	CourseSection.sectionsInCourse(args, function(error, sectionUUIDs) {		
		if(sectionUUIDs){									
			async.forEach(sectionUUIDs, function(sectionUUID, callback) {				
				console.log("section ID = " + sectionUUID);
				var sectionMaterials = require('./sectionMaterial.js');				

				sectionMaterials.findAllMaterialsInSection({section:sectionUUID}, function(error, sectionMaterial) {
					async.forEach(sectionMaterial, function(resourceID, callback) {
						console.log("resource IDs = " +  resourceID.material);
						module.exports.getResourceByUUID(resourceID.material, function(error, resource) {											
							resources.push(resource);	

							// once the result is retrieved pass it to the callback
							callback();																												
						})
					}, function(err){					    
					    console.log("Section Material error = " + err);

					    // passed the result to outer loop
					    callback();
					});									
				})				
			}, function(err){
			    // if any of the saves produced an error, err would equal that error
			    console.log("Course Section error = " + err);
			    callback(null, resources);
			});										
		}

		//No sectionUUIDs were found
		else{
			callback(error, []);
		}
	})
}
*/

//Creates a new resources and saves it to the database
//userUUID is the uuid of the user submitting the resource
exports.createResource = function(userUUID, args, callback){
	var User = require(__dirname + '/user.js');
	args.user = userUUID;
	args.uuid = UUID.generate();
	User.getUserCourses(userUUID, function(error, courses){
		var isCourseMember = false;
		if(error){
			callback(error, null);
		}

		if(courses.length === 0){
			callback("Can't create resource.  No courses found for user.", null);
		}

		for(index in courses){
			if(args.course === courses[index].uuid){
				isCourseMember = true;
			}
		}
		
		if(isCourseMember){
			Resource.create(args).success(function(resource){
				callback(null, resource);
			}).error(function(error){
				console.log("can't create resource " + error);
				callback(error, null);
			});
		}
		else{
			callback("You can't create a resource for a course you aren't enrolled in", null);
		}	
	});
}

//Deletes the resource with the given uuid
exports.deleteResource = function(resourceUUID, callback){
	Resource.find({where: {uuid:resourceUUID}}).success(function(resource){
		if(resource){
			resource.destroy().success(function(result){
				callback(null, result);
			}).error(function(error){
				callback(error, null);
			})
		}
		else{
			callback("That resource doesn't exist!", null);
		}
	})
}

//Gets the number of likes for the course with the given uuid
exports.getLikesByUUID = function(resourceUUID, callback){
	Resource.find({where:{uuid: resourceUUID}}).success(function(resource){
		if(resource){
			callback(null, resource.likes);
		}
		else{
			callback("No resource found", null);
		}
	}).error(function(error){
		callback(error, null);
	})
}



//take a week number, return a range of date
var weekHelper = exports.weekHelper = function(weekNumber){
	Date.prototype.yyyymmdd = function() {
		var yyyy = this.getFullYear().toString();
		var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
		var dd  = this.getDate().toString();
		return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' +(dd[1]?dd:"0"+dd[0]); // padding
	};



	var semesterStart = new Date('2012-05-07T07:00:00.000Z');   //this is UTC time
	var firstWeekEnd = new Date(semesterStart.getTime() + (6 - semesterStart.getDay())*24*60*60*1000); //notice sunday is the first day of week here
	var startDate = new Date();
	var endDate = new Date();
	var oneWeek = 7*24*60*60*1000;
	if (weekNumber === 1){
		return {start:semesterStart.yyyymmdd(),end:firstWeekEnd.yyyymmdd()};
	}
	else{
		var weekStart = new Date( firstWeekEnd.getTime()+ (weekNumber-2)* oneWeek);
		var weekEnd  =  new Date( firstWeekEnd.getTime()+ (weekNumber-1)* oneWeek);
		return {start:weekStart.yyyymmdd(), end:weekEnd.yyyymmdd()};


	}
}

//this function add the needed second level deatials into json object, use it from REST level code.
var resourceHelper = exports.resourceHelper = function(currentUser,resources,callback){

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

		findUserProfile: function(callback){
			parsedResult = JSON.parse(JSON.stringify(resources));
			async.forEach(parsedResult, function (resource, callback) {

					UserProfile.getUserProfile(resource.user.uuid, function (error, profile) {
						if (profile) {
							resource.user.avatar = profile.profilePicture;
						}
						callback();
					});
				},
				function (err) {

					callback(err)
				})
		},

//		findSectionId:function (callback) {
//			parsedResult = JSON.parse(JSON.stringify(resources));
//			async.forEach(parsedResult , function (resource, callback) {
//
//					SectionMaterial.findSectionIdByMaterialId({"material":resource.uuid}, function (err, result) {
//						if (result) {
//							resource.section = result.section;
//						}
//						callback(err);
//					});
//				},
//				function (err) {
//
//					callback(err)
//				})
//
//		},
//
//		findSectionInfo:function (callback){
//			async.forEach(parsedResult , function (resource, callback) {
//
//					Section.findSectionById({"uuid":resource.section}, function (err, result) {
//						if (result) {
//
//							resource.section = result;
//						}
//						callback(err);
//					});
//				},
//				function (err) {
//					callback(err)
//				})
//
//		},

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
		,
		findIsStarred:function (callback) {


			async.forEach(parsedResult, function (resource, callback) {
					Star.isResourceStarred({user:currentUser, resource:resource.uuid},function(err,result){
						if  (result){
							resource.starred = true
						}
						else{

							resource.starred = false;
						}

						callback(err);



					})

				}
				, function (err) {
					callback(err)
				})
		}


	}, function(err){


		callback(null, parsedResult);

	}) ;


}