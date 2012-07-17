var fs = require('fs');
var config = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');
var Sequelize = require('sequelize');
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
	, url: {type: Sequelize.STRING, allowNull: false}
});

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