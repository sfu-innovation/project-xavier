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
	SectionMaterial.findAll({ where : { material : args.resource, section  : args.section }}).success( function ( sectionMaterials ){
		if ( 0 === sectionMaterials.length ){
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
	When we want to remove a resource from a section. We need to make sure 
	that the courseMaterial exists before we try to destroy it.
	
	args = {
		section : UUID of the section
		resource : UUID of the resource
	}
	
	returns the default section uuid for that course.
*/
OrganizationAction.prototype.removeResourceFromSection = function( args, callback ){
	SectionMaterial.findAll({ where : { section : args.section, material : args.resource}})
		.success(function( sectionMaterials ){
		if ( 1 === sectionMaterials.length){
			sectionMaterials[0].destroy().error(function(error){
				callback(error, null );
			}).success(function(){
				callback( null, removed );
			});
		}
			
		
		else {
			callback(" Invalid number of sectionMaterials to remove", null);
		}
	}).error(function( error ){ // error block - SectionMaterial.findAll
		callback( error, null );
	});
}

/*
	We want to update a courseMaterial so this general means that we want to move 
	a material from one section to another. I am assuming because we have both the
	UUIDs of the sectin and the new section to move to that both Sections exist in
	the Sections table and we really only care about the relationship at this point
	between the material and the section.
	
	args = {
		section : UUID of the section
		newSection : UUID of the section
		resource : UUID of the resource
	}
	
	returns the default section uuid for that course.
*/
OrganizationAction.prototype.updateResourceFromSectionToSection = function( args, callback ){
    // we first look into sectionMaterials to see if the material is already associated with the new section
    SectionMaterial.find({ where : { section : args.newSection, material : args.resource }}).success(function( sectionMaterial){
    	if ( null === sectionMaterial ){
    	    //if it is NOT already associated, we then go find the resource associated with the current section
    		SectionMaterial.find({ where : { section : args.section, material : args. resource}})
    			.success(function( moveSectionMaterial ){
    				if ( null === moveSectionMaterial ){
    				// if the section we want to remove from doesnt even exist, stop
    					callback("The section associated with the resource does not exist ", null );
    					return;
    				}
    				// by this point we have validated that where we want to move to and where are moving from both exist
    				moveSectionMaterial.updateAttributes({ section : args.newSection }).error(function(error ){
							callback( error, null );
						}).success(function( movedSectionMaterial ){
							callback( null, moveSectionMaterial );
						});
    			});
    	}
    	else {
    		callback( "The material already exists in the section you wanted to move it to ", null );
    	}
    });
}

/*
	In order to create a section, we first need to go through and see that the course section
	doesnt already exist. Unfortunately at this time we can only really compare sections by
	title which is not good but at this time I cant think of anything better ( July 13 ).
		
	args = {
		title : Name of the section if this is "default", no section will be made
		course: UUID of the course
		app   : enumerated type of the application, refer to enumerated types in docs
	}
	
	returns the UUID of the new section
*/
OrganizationAction.prototype.addSection = function( args, callback){
    // we first need to get a list of the sections of this course
	CourseSection.findAll({ where : { course : args.course }}).success( function( courseSections ){
		var sectionID = new Array();
		var i = courseSections.length - 1;
		for (; i >= 0; i--){
			sectionID.push( courseSections[i].section );
		}
		//we use this list of sections to determine that we dont already have a section with this name
		//this is kind of bad but we dont have anything else to identify on at this time
		Section.findAll({ where : { uuid : sectionID, title : args.title }}).success(function( sections ){
			if ( 0 === sections.length ){
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
		}).error( function( error ){ // error block -  Section.findAll 
			callback( error, null );
		});
		
	}).error( function( error ){  // error block - CourseSection.findAll
		callback( error, null );  
	});
}

/*
	Removing a section means that if it exists in a course section, the course section
	will be removed and any section materials associated with this section will be removed.
	In order for a CourseSection to have been created it would have to be associated with
	a course so if the courseSection has no knowledge of this relationship we should stop
	right away when removing a section. Resources associated with this section are optional
	so if there are reasources we need to disassociate on the sectionmaterials table.
	At the very end we must remove the section entry in the sections table.
		
	args = {
		section : UUID of section to remove
	}
	
	returns the UUID of the deleted section
*/
OrganizationAction.prototype.removeSection = function( args, callback){
	CourseSection.find({ where : { section : args.section }}).success( function( courseSection ){
		if ( null === courseSection ){
			callback("The section doesn't exist", null );
			return;
		}
		else {
			courseSection.destroy().error(function ( error ){
				callback( error, null );
				return;
			});
		}
		SectionMaterial.findAll({ where : { section : args.section }}).success(function( sectionMaterials ){
			if ( sectionMaterials.length > 0 ) {
				var i = sectionMaterials.length - 1;
				for(; i >= 0; i--){
					sectionMaterials[i].destroy().error( function ( error ){
						callback( error, null );
					});
				}
			}
		});
		Section.find({ where : { uuid : args.section }}).success(function(sectionToBeRemoved){
			if ( null === sectionToBeRemoved ){
				callback("This section does not exist " + args.section , null );
			}
			else {
				sectionToBeRemoved.destroy().error(function(error){
					callback(error, null);
				});
			}
		});
}

/*
	Removing a section means that if it exists in a course section, the course section
	will be removed and any section materials associated with this section will be removed.
		
	args = {
		section : UUID of section to remove
		title   : new sectionName
	}
	
	returns the UUID of the deleted section
*/
OrganizationAction.prototype.updateSection = function( args, callback){
  CourseSection.findAll({ where : { course : args.course }}).success( function( courseSections ){
		var sectionID = new Array();
		var i = courseSections.length - 1;
		for (; i >= 0; i--){
			sectionID.push( courseSections[i].section );
		}
		// we need to make sure there are no other sections for this course with the same title
		Section.findAll({ where : { uuid : sectionID, title : args.title }}).success(function( sections ){
			if ( 0 === sections.length ){
				Section.find({ where : { uuid : args.section }}).success(function( section ){
					section.updateAttributes({ title : args.title }).error(function(err0r ){
						callback( error, null );
					});
				});
			}
			else {
				callback("There is already a section associated with this course with the same name", null );
			}
		}).error(function(error){
			callback( error, null );
		});
		
	}).error( function ( error ){
		callback( error, null );
	});
}

OrganizationAction.prototype.
/*
	Get all of the sections in a course
	
	args = {
		course: UUID of course
	}
	
	Returns an array of all the sections associated with the course
*/
OrganizationAction.prototype.coursesInSection = function( args, callback ){
	CourseSection.findAll({ where : { course : args.course }}).success(function ( courseSections ){
		var sectionsInCourse = new Array();
		var i = courseSections.length - 1;
		for(; i >= 0; i-- ){
			sectionsInCourse.push(courseSections[i].section);
		}
		Section.findAll({ where : { uuid : sectionsInCourse }}).success(function( sections ){
			var retSections = new Array();
			var x = sections.length -1 ;
			for ( ; x >= 0; x-- ){
				retSections.push(sections[i]);
			}
			callback( null, retSections );
			return;
		}).error( function ( error ) {
			callback( error, null );
		}
	}).error(function( error ){
		callback( error, null );
	});
}

/*
   To get all of the resources in a section
	args = {
		section : UUID of section
	}
	Returns the resources in a section
*/
OrganizationAction.prototype.resourcesInSection = function( args, callback ){
	SectionMaterial.findAll({ where : { section : args.section }}).success(function( sectionMaterials){
		var resourcesInSection = new Array();
		var i = sectionMaterials.length - 1;
		for(; i >= 0; i-- ){
			resourcesInSection.push(sectionMaterials[i].material);
		}
		Resource.findAll({ where : { uuid : resourcesInSection }}).success(function( resources ){
			var retResources = new Array();
			var x = resources.length - 1;
			for( ; x >= 0; x-- ){
				retResources.push( resources[i] );
			}
			callback( null, retResources );
		}).error(function(error){
			callback( error, null );
		});
	}).error(function(error){
		callback( error , null );
	});
}

/*
    Gets count of all of the resources in particular course.
    
	args = {
		course : UUID of course
	}
	
	Returns number of materials in resource
*/

OrganizationAction.prototype.numberOfResourcesInCourse = function( args, callback ){
	CourseSection.findAll({ where : { course : args.course }}).success(function( sections ){
		var sectionsInCourse  = new Array();
		var i = sections.length - 1;
		for(; i >= 0; i-- ){
			sectionsInCourse.push( sections[i].section );
		}
		SectionMaterial.findAll({ where : { section : sectionsInCourse }}).success(function( resources ){
			callback( null, resources.length );
		}).error(function(error){
			callback(error, null );
		});
	}).error(function(error){
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
		title : "Title Description3",  
	//	section : "ec68c6c6-8844-4c9d-b806-92d70ffaf253",  // default section
		course : "A827346H7ASDFG9",
		app : 1
  };
  
  
var object2 = {
		//	"user":"A7S7F8GA7SD11A7SDF8ASD7G",
		/*    "app":"Accent",
		    "target":"B857346H7ASDFG9",
		    "attribute":2,
		    "description": "This is a test description"
		    */
		//title : "Default",
		//title : "Title Description3",  
		"resource" : "A7S7FWGA7SD11A7SDF8ASD7G",  // default section
		"section" : "85c12caf-61ee-42de-9afa-d28a82e7ac9b"
	//	app : 1
  };



var organizationAction = new OrganizationAction();
//addSection
//addDefaultSection
//addResourceToDefaultSection
//removeSection
// A7S7FWGA7SD11A7SDF8ASD7G - resource ID

/*
organizationAction.addDefaultSection( object, function( err, data){
	if (data ) {
		console.log( "[SUCCESS] - "+ data);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/
/*
organizationAction.addSection( object, function( err, data){
	if (data ) {
		console.log( "[SUCCESS] - "+ data);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/
//
organizationAction.removeResourceFromSection( object2, function( err, data){
	if (data ) {
		console.log( "[SUCCESS] - "+ data);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
  
/*
organizationAction.removeSection( object2, function( err, data){
	if (data ) {
		console.log( "[SUCCESS] - "+ data);
	} else {
		console.log( "[ERROR] - "+err);
	}
});
*/
  