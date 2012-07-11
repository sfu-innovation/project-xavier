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
var UUID = require('com.izaakschroeder.uuid');
var SectionMaterial = require('sectionMaterial.js');
var CourseSection   = require('courseSection.js');

var Section = exports.Section = db.define('Section', {
	uuid: {type: Sequelize.STRING, allowNull: false},
	title: {type: Sequelize.STRING, allowNull: false},
	app  : {type: Sequelize.INTEGER, allowNull: false}
});

/*
	Creating a new non default section. We then associate the section to the course.
		
	args = {
		title : Name of the section if this is "default", no section will be made
		course: UUID of the course
		app   : enumerated type of the application, refer to enumerated types in docs
	}
	
	returns the UUID of the new section
*/
exports.AddSection = function( args, callback){
	if ( "default" === title ){
		callback("unable to create default section", null );
	}
	Section.findAll({ where : { title : args.title, app : args.app }}).success( function( similarCourses) {
		CourseSection.findAll({ where : { section : similarCourses.uuid }}).success( function( courseSections ){
			if ( null === courseSections ){
				var newUUID = UUID.generate();
				Section.create({ uuid : newUUID, title : args.title, app : args.app }).success(function(section){
					CourseSection.create( { course : args.course, section : newUUID, app : args.app }).success(function(newCourseSection){
						callback( null, newUUID );
					}).error(function(error){
					callback( error, null);
					});
				}).error(function(error){
				callback(error, null );
				});
			}
			else {
				callback(" The section already exists with this course", null );
			}
		}).error( function( error ){  // if there was an error in looking for course sections
			callback( error, null );  // with similar uuids
		});
	}).error( function( error ){  // if there was an error in finding courses
		callback( error, null );  // that had the same title and under the same app
	});
}

/*
	Creating a new default section. We then associate the section to the course.
		
	args = {
		course: UUID of the course
		app   : enumerated type of the application, refer to enumerated types in docs
	}
	
	returns the UUID of the new section
*/
exports.AddDefaultSection = function( args, callback){
	var defaultTitle = "Default";
	Section.findAll({ where : { title : defaultTitle, app : args.app }}).success( function( similarCourses) {
		CourseSection.findAll({ where : { section : similarCourses.uuid }}).success( function( courseSections ){
			if ( null === courseSections ){
				var newUUID = UUID.generate();
				Section.create({ uuid : newUUID, title : defaultTitle, app : args.app }).success(function(section){
					CourseSection.create( { course : args.course, section : newUUID, app : args.app }).success(function(newCourseSection){
						callback( null, newUUID );
					}).error(function(error){
					callback( error, null);
					});
				}).error(function(error){
				callback(error, null );
				});
			}
			else {
				callback(" The section already exists with this course", null );
			}
		}).error( function( error ){  // if there was an error in looking for course sections
			callback( error, null );  // with similar uuids
		});
	}).error( function( error ){  // if there was an error in finding courses
		callback( error, null );  // that had the same title and under the same app
	});
}
/*
	Creating a new non default section. We then associate the section to the course.
		
	args = {
		section : UUID of section to remove
		course: UUID of the course
		app   : enumerated type of the application, refer to enumerated types in docs
	}
	
	returns the UUID of the deleted section
*/
exports.RemoveSection = function( args, callback){
	if ( "Default" === title ){
		callback("Unable to remove default section from course");
	}
	CourseSection.find({ where : { section : args.section }}).success( function( courseSection ){
		var courseID = courseSection.course; // this is the course ID we need to work with
		Section.findAll({ where : { title : "Default", app : args.app }}).success( function( sections ){
			CourseSection.find({ where : { course : courseID, section : sections.uuid }}).success(function( defaultSection ){
				var defaultSectionID = defaultSection.section;
				SectionMaterial.findAll({ where : {section : args.section }}).success(function( sectionMaterials ){
					var i = sectionMaterials.length - 1;
					for ( ; i >= 0; i-- ){
						sectionMaterials[i].updateAttributes({
  							section: defaultSectionID;
						}).error(function(error) { // if there is a wierd crash at this point since im not sure how to do 
							callback( error, null ); // transactions in sequelize, we could get really screwed up at this point
						}); 
					}
					courseSection.destroy().error( function ( error ){
						callback( error, null );
					});
					section.find({where : { uuid : section }}).success( function( removedSection ){
						callback( null, removedSection );
					}).error( function ( error ){
						callback( error, null);
					});
				}).error( function ( error ){
					callback( error, null );
				});
			}).error( function( error ){
				callback( error, null );
			});
		});
		Section.find({ where : { title : "Default",
	}).error( function( error ) {
		callback( error, null );
	}
	Section.findAll({ where : { title : "Default", app : args.app }}).success( function( similarCourses) {
		CourseSection.findAll({ where : { section : similarCourses.uuid }}).success( function( courseSections ){
			if ( null === courseSections ){
				var newUUID = UUID.generate();
				Section.create({ uuid : newUUID, title : defaultTitle, app : args.app }).success(function(section){
					CourseSection.create( { course : args.course, section : newUUID, app : args.app }).success(function(newCourseSection){
						callback( null, newUUID );
					}).error(function(error){
					callback( error, null);
					});
				}).error(function(error){
				callback(error, null );
				});
			}
			else {
				callback(" The section already exists with this course", null );
			}
		}).error( function( error ){  // if there was an error in looking for course sections
			callback( error, null );  // with similar uuids
		});
	}).error( function( error ){  // if there was an error in finding courses
		callback( error, null );  // that had the same title and under the same app
	});
}
exports.addResourceToSection = function( args, callback ){

}

exports.removeSectionFromCourse = function( args, callback ){

}

exports.removeResourceFromSection = function( args, callback ){

}
