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

var SectionMaterial = exports.SectionMaterial = db.define('SectionMaterial', {
	section: {type: Sequelize.STRING, allowNull: false},
	material: {type: Sequelize.STRING, allowNull: false},
	cs
});

/*
	args = {
		resource : UUID of the resource.
		course   : UUID of the course.
	}
	
	returns the section UUID
*/
exports.addResourceToDefault = function( args, callback ){
	CourseSection.findAll({where : { course : args.course }}).success( function( sections ){
		Section.find({ where : { title : "Default", uuid : sections.section }}).success(function( defaultSection ){
			SectionMaterial.create({ section : defaultSection.uuid , material : args.resource}).success( function ( savedMaterial ){
				callback( null, defaultSection.uuid );
			}).error( function ( error ){
				callback( error, null );
			});
		}).error( function ( error ){
			callback( error, null );
		});
	}).error( function ( error ){
		callback( error, null );
	});
}
/*
	To add a resource to a section. Resources must be added to a section,
	if the user wants to try to add them to a course they will be default be 
	in the default section by calling addResourceToDefault.
	
	We are going in with the precondition that the default section exists
	for the course.
	
	args = {
		section : UUID of the section
		resource : UUID of the resource
	}	
	
	The newly added resource UUID.
*/
exports.addResourceToSection = function( args, callback ){
    if ( null === args.section ){
    	callback("Please use addResourceToDefault", null );
    }
	SectionMaterial.findAll({ where : { material : args.resource, section  : args.section }}).success( function ( sectionMaterials ){
		if ( null === sectionMaterials ){
			SectionMaterial.create({ section : args.section, material : args.resource}).success( function ( savedMaterial ){
				callback( null, args.section );
			}).error( function ( error ){
				callback( error, null );
			});
		}
		else {
			callback ("The section material already exists", null );
		}
	}).error( function ( error ){
		callback( error, null );
	});
}

/*
	When we want to remove a resource from a section. We simply move the section UUID
	to be the default section UUID for that course
	
	args = {
		section : UUID of the section
		resource : UUID of the resource
	}
	
	returns the default section uuid for that course.
*/
exports.removeResourceFromSection = function( args, callback ){
	CourseSection.find({ where : { section : args.section }}).success(function ( courseSection ){
		if ( null === section ){
			callback( "There was no course for this section ");
		}
		var courseID =  courseSection.course;
		CourseSection.findAll({ where : { course : courseID }}).success(function( courseSectionsOfOneCourse ){
			Section.find({ where : { uuid : courseSectionsOfOneCourse.section, title : "Default"}}).success(function(defaultSection){
				var defaultSectionID = defaultSection.uuid;
				SectionMaterial.find({ where : { material : args.resource }}).success( function( materialToDefault ){
					materialToDefault.updateAttributes({
  							section: defaultSectionID;
						}).error(function(error) { // if there is a wierd crash at this point since im not sure how to do 
							callback( error, null ); // transactions in sequelize, we could get really screwed up at this point
						}); 
					callback( null, defaultSectionID );
				}).error(function(error){
					callback( error, null);
				});
			}).error(function(error){
				callback( error, null );
			});
			
		}).error( function ( error ){
			callback( error , null );
		});
	}).error(function(error){
		callback( error, null );
	});

}
