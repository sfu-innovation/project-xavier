var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');
var CourseSection = require('../models/courseSection.js');
var Section = require('../models/section.js');
var SectionMaterial = require('../models/sectionMaterial.js');	
var SectionImpl = require('../models/section.js').Section;
var Resource    = require('../models/resource.js').Resource;
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
	
	SectionMaterial.findAMaterialInSection( args, function( error, sectionMaterial){
		if ( null === sectionMaterial ) {
			SectionMaterial.createSectionMaterial( args, function( error, newSectionMaterial){
				callback( null, newSectionMaterial);
			});
		}else {
			callback ("The section material already exists", null );
		}
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
    SectionMaterial.findAMaterialInSection( args, function( error, sectionMaterial ){
    	var argsToRemove = {
    		sectionmaterial : sectionMaterial
    	}
    	SectionMaterial.removeMaterialFromSection( argsToRemove, function( error, removedMaterial ){
    		callback( null, removedMaterial );
    	});
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
		newsection : UUID of the section
		resource : UUID of the resource
	}
	
	returns the default section uuid for that course.
*/
OrganizationAction.prototype.updateResourceFromSectionToSection = function( args, callback ){
	SectionMaterial.findAMaterialInSection( args, function( error, sectionMaterial ){
		args.sectionmaterial = sectionMaterial;
		SectionMaterial.updateSectionMaterial( args, function( error, updatedMaterial ){
			callback( null, updatedMaterial );
		});
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
	CourseSection.sectionsInCourse( args, function( error, courseSectionUUIDs){
		if ( error ){
			callback( error, null );
			return;
		}
		args.sections = courseSectionUUIDs;
		Section.findSection( args, function ( error, section ){
			if ( error ){
				callback( error, null );
				return;
			}
			Section.createSection( args, function ( error, newSection ){
				if ( error ){
					callback( error , null );
					return;
				}
				args.section = newSection.uuid;
				CourseSection.createCourseSection( args, function ( error, newCourseSection ){
					if ( error ){
						callback( error, null );
						return;
					}
					else {
						callback( null, newSection);
					}	
				});
			});
		});
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
	CourseSection.removeCourseSection( args, function( error, removedCourseSection ){
		if ( error ){
					callback( error, null );
					return;
		}
		SectionMaterial.findAllMaterialsInSection( args, function( error, sectionMaterials ){
			if ( error ){
					callback( error, null );
					return;
			}
			args.sectionmaterials = sectionMaterials;
			SectionMaterial.removeAllMaterialFromSection( args, function( error, removedSectionMaterials ){
				if ( error ){
					callback( error, null );
					return;
				}
				Section.removeSection( args, function( error, removedSection ){
					if ( error ){
						callback( error, null );
						return;
					}
					callback( null, removedSection );
				});	
			});
		});
	});
}

/*
	Removing a section means that if it exists in a course section, the course section
	will be removed and any section materials associated with this section will be removed.
		
	args = {
		newtitle : new sectionName
		course  : course UUID
		title   : new sectionName
	}
	
	returns the UUID of the deleted section
*/
OrganizationAction.prototype.updateSection = function( args, callback){
    CourseSection.sectionsInCourse( args, function( error, courseSections ){
    	if ( error ){
    			callback( error, null );
    			return;
    	}
    	args.sections = courseSections;
    	Section.findSection( args, function( error, section ){
    		if ( error ){
    			callback( error, null );
    			return;
    		}
    		args.sectionObject = section;
    		args.title = args.newtitle;
    		Section.updateSection( args, function( error, updatedSection ){
    			callback( null, updatedSection );
    		});
    	});
    });
}

/*
	Get all of the sections in a course
	
	args = {
		course: UUID of course
	}
	
	Returns an array of all the sections associated with the course
*/
OrganizationAction.prototype.sectionsInCourse = function( args, callback ){
	CourseSection.sectionsInCourse( args, function( error, courseSections ){
		SectionImpl.findAll({ where : { uuid : courseSections }}).success(function( sections ){
			var retSections = new Array();
			var x = sections.length -1 ;
			for ( ; x >= 0; x-- ){
				retSections.push(sections[x]);
			}
			callback( null, retSections );
			return;
		}).error( function ( error ) {
			callback( error, null );
		});
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
	SectionMaterial.findAllMaterialsInSection( args, function( error, sectionMaterials ){
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
	CourseSection.sectionsInCourse( args, function( error, courseSections ){
		if ( error ) {
			callback( error, null );
			return;
		}
		args.section = courseSections;
		SectionMaterial.findAllMaterialsInSection( args, function( error, sectionMaterials ){
			if ( error ) {
				callback( error, null );
			}
			else {
				callback( null, sectionMaterials.length );
			}
		});
	});
}

module.exports = new OrganizationAction;
