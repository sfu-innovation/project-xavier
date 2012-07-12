var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');
var CourseSection = require('../models/courseSection.js').CourseSection;
var Section = require('../models/section.js').Section;
var SectionMaterial = require('../models/sectionMaterial.js').SectionMaterial;	

var OrganizationAction = function(){}

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
OrganizationAction.prototype.addResourceToSection = function( args, callback ){
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
   Adds a resource to a default section of the course
	args = {
		resource : UUID of the resource.
		course   : UUID of the course.
	}
	
	returns the section UUID
*/

OrganizationAction.prototype.addResourceToDefaultSection = function( args, callback ){
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
	When we want to remove a resource from a section. We simply move the section UUID
	to be the default section UUID for that course
	
	args = {
		section : UUID of the section
		resource : UUID of the resource
	}
	
	returns the default section uuid for that course.
*/
OrganizationAction.prototype.removeResourceFromSection = function( args, callback ){
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
  							section: defaultSectionID
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



/*
	Creating a new non default section. We then associate the section to the course.
		
	args = {
		title : Name of the section if this is "default", no section will be made
		course: UUID of the course
		app   : enumerated type of the application, refer to enumerated types in docs
	}
	
	returns the UUID of the new section
*/
OrganizationAction.prototype.addSection = function( args, callback){
	if ( "Default" === args.title ){
		callback("unable to create default section", null );
		return;	
	}
	Section.findAll({ where : { title : args.title, app : args.app }}).success( function( similarCourses) {
		CourseSection.findAll({ where : { section : similarCourses.uuid }}).success( function( courseSections ){
			if ( 0 === courseSections.length ){
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
	}
	
	returns the UUID of the new section
*/
OrganizationAction.prototype.addDefaultSection = function( args, callback){
	var defaultTitle = "Default";
	CourseSection.findAll({ where : { course : args.course }}).success( function( courseSections ){
		console.log(courseSections );
		if ( 0 === courseSections.length ){
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
}
/*
	To remove a section we first must redirect all resources linked to this section
	to the default section of this course. We then remove the link of the soon to be 
	deleted section from the courseSections and then finally remove the section.
		
	args = {
		section : UUID of section to remove
		course: UUID of the course
		app   : enumerated type of the application, refer to enumerated types in docs
	}
	
	returns the UUID of the deleted section
*/
OrganizationAction.prototype.removeSection = function( args, callback){
	if ( "Default" === title ){
		callback("Unable to remove default section from course");
	}
	CourseSection.find({ where : { section : args.section }}).success( function( courseSection ){
		var courseID = courseSection.course; // this is the course ID we need to work with
		Section.findAll({ where : { title : "Default", app : args.app }}).success( function( sections ){
			CourseSection.find({ where : { course : courseID, section : sections.uuid }}).success(function( defaultSection ){
				var defaultSectionID = defaultSection.section;
				// we need to redirect all of the resources from this section to the default section
				SectionMaterial.findAll({ where : {section : args.section }}).success(function( sectionMaterials ){
					var i = sectionMaterials.length - 1;
					for ( ; i >= 0; i-- ){
						sectionMaterials[i].updateAttributes({
  							section: defaultSectionID
						}).error(function(error) { // if there is a wierd crash at this point since im not sure how to do 
							callback( error, null ); // transactions in sequelize, we could get really screwed up at this point
						}); 
					}
					// we need to remove the association between the section to the cousrse
					courseSection.destroy().error( function ( error ){
						callback( error, null );
					});
					// we can now finally remove the section itself
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
		callback( error, null );
	});
}


//module.exports = new OrganizationAction;



var object = {
		//	"user":"A7S7F8GA7SD11A7SDF8ASD7G",
		/*    "app":"Accent",
		    "target":"B857346H7ASDFG9",
		    "attribute":2,
		    "description": "This is a test description"
		    */
	//	title : "Default",
		title : "Title Description",    
		course : "A827346H7ASDFG9",
		app : 1
  };


var organizationAction = new OrganizationAction();
organizationAction.addSection( object, function( err, data){
	if (data ) {
		console.log( "[SUCCESS] - "+ data);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
  