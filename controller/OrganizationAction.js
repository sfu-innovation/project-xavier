var fs      = require("fs");
var config  = JSON.parse(fs.readFileSync("config.json"));
var UUID = require('com.izaakschroeder.uuid');
var CourseSection = require('../models/courseSection.js');
var Section = require('../models/section.js');
var SectionMaterial = require('../models/sectionMaterial.js');	
var SectionImpl = require('../models/section.js').Section;
var Resource    = require('../models/resource.js').Resource;
var OrganizationAction = function(){};

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
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.addResourceToSection] error - Args is not existent");
		callback( null, "" );
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('section') &&
		                         args.hasOwnProperty('resource'));
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.addResourceToSection] error - Invalid args");
		callback( null, "" );
		return;		
	}

	SectionMaterial.findAMaterialInSection( args, function( error, sectionMaterial){
		if ( null === sectionMaterial ) {
			SectionMaterial.createSectionMaterial( args, function( error, newSectionMaterial){
				callback( null, newSectionMaterial);
			});
		}else {
			console.log("[OrganizationAction.updateResourceFromSectionToSection] error - The section material already exists");
			callback( null, "" );
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
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.removeResourceFromSection] error - Args is not existent");
		callback( null, "" );
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('section') &&
		                         args.hasOwnProperty('resource'));
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.updateResourceFromSectionToSection] error - Invalid args");
		callback( null, "" );
		return;		
	}

    SectionMaterial.findAMaterialInSection( args, function( error, sectionMaterial ){
    	if ( error ){
    		console.log("[SectionMaterial.findAMaterialInSection] error - "+error);
		    callback( null, "" );
		    return;
    	}
    	var argsToRemove = {
    		sectionmaterial : sectionMaterial
    	}
    	SectionMaterial.removeMaterialFromSection( argsToRemove, function( error, removedMaterial ){
    		console.log("[SectionMaterial.removeMaterialFromSection] error - "+error);
		    callback( null, "" );
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
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.updateResourceFromSectionToSection] error - Args is not existent");
		callback( null, "" );
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('section') &&
	                          args.hasOwnProperty('newsection') &&
		                         args.hasOwnProperty('resource') );
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.updateResourceFromSectionToSection] error - Invalid args");
		callback( null, "" );
		return;		
	}

	SectionMaterial.findAMaterialInSection( args, function( error, sectionMaterial ){
		if ( error ){
			console.log("[SectionMaterial.findAMaterialInSection] error - "+error);
			callback( null, "" );
			return;
		}	
		args.sectionmaterial = sectionMaterial;
		SectionMaterial.updateSectionMaterial( args, function( error, updatedMaterial ){
			if ( error ){
				console.log("[SectionMaterial.updateSectionMaterial] error - "+error);
				callback( null, "" );
			}
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
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.addSection] error - Args is not existent");
		callback( null, "");
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('title') &&
	                            args.hasOwnProperty('course') &&
		                         args.hasOwnProperty('app') );
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.addSection] error - Invalid args");
		callback( null, "");
		return;		
	}

	CourseSection.sectionsInCourse( args, function( error, courseSectionUUIDs){
		if ( error ){
			console.log("[CourseSection.sectionsInCourse] error - "+error);
			callback( null, "" );
			return;
		}
		args.sections = courseSectionUUIDs;
		Section.findSection( args, function ( error, section ){
			if ( error ){
				console.log("[Section.findSection] error - "+error);
				callback( null, "" );
				return;
			}
			Section.createSection( args, function ( error, newSection ){
				if ( error ){
					console.log("[Section.createSection] error - "+error);
			        callback( null, "" );
					return;
				}
				args.section = newSection.uuid;
				CourseSection.createCourseSection( args, function ( error, newCourseSection ){
					if ( error ){
						console.log("[CourseSection.createCourseSection] error - "+error);
			            callback( null, "" );
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
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.removeSection] error - Args is not existent");
		callback( null, "");
		return;
	}
	var containsAllProperties = args.hasOwnProperty('section');
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.removeSection] error - Invalid args");
		callback( null, "");
		return;		
	}

	CourseSection.removeCourseSection( args, function( error, removedCourseSection ){
		if ( error ){
			console.log("[CourseSection.removeCourseSection] error - "+error);
			callback( null, "");
			return;
		}
		SectionMaterial.findAllMaterialsInSection( args, function( error, sectionMaterials ){
			if ( error ){
				console.log("[SectionMaterial.findAllMaterialsInSection] error - "+error);
				callback( null , "" );
				return;
			}
			args.sectionmaterials = sectionMaterials;
			SectionMaterial.removeAllMaterialFromSection( args, function( error, removedSectionMaterials ){
				if ( error ){
					console.log("[SectionMaterial.removeAllMaterialFromSection] error - "+error);
					callback( null, "" );
					return;
				}
				Section.removeSection( args, function( error, removedSection ){
					if ( error ){
						console.log("[Section.removeSection] error - "+error);
						callback( null, "" );
						return;
					}
					else {
						callback( null, removedSection );
					}
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
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.updateSection] error - Args is not existent");
		callback( null, "" );
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('newtitle') && 
	                               args.hasOwnProperty('course') &&
		                            args.hasOwnProperty('title') );
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.updateSection] error - Invalid args");
		callback( null, "");
		return;		
	}

    CourseSection.sectionsInCourse( args, function( error, courseSections ){
    	if ( error ){
    		console.log("[CourseSection.sectionsInCourse] error - "+error);
    		callback( null, "");
    		return;
    	}
    	args.sections = courseSections;
    	Section.findSection( args, function( error, section ){
    		if ( error ){
    			console.log("[Section.findSection] error - "+error);
    			callback( null, "");
    			return;
    		}
    		args.sectionObject = section;
    		args.title = args.newtitle;
    		Section.updateSection( args, function( error, updatedSection ){
    			if ( error ){
    				console.log("[Section.updateSection] error - "+error);
    				callback( null, "");
    				return;
    			}
    			else {
    				callback( null, updatedSection );
    			}
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
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.sectionsInCourse] error - Args is not existent");
		callback( null, new Array());
		return;
	}
	var containsAllProperties = args.hasOwnProperty('course');
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.sectionsInCourse] error - Invalid args");
		callback( null, new Array());
		return;		
	}

	CourseSection.sectionsInCourse( args, function( error, courseSections ){
		if ( error ){
			console.log("[CourseSection.sectionsInCourse] error - "+error);
			callback( null, new Array());
			return;
		}
		SectionImpl.findAll({ where : { uuid : courseSections }}).success(function( sections ){
			var retSections = new Array();
			var x = sections.length -1 ;
			for ( ; x >= 0; x-- ){
				retSections.push(sections[x]);
			}
			callback( null, retSections );
			return;
		}).error( function ( error ) {
			console.log("[SectionImpl.findAll] error - "+error);
			callback( null , new Array() );
			return
		});
	});
}

/*
   To get all of the resources in a section
	args = {
		appType : (for ES)
		section : UUID of section
	}
	Returns the resources in a section
*/
OrganizationAction.prototype.resourcesInSection = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		console.log("[OrganizationAction.resourcesInSection] error - Args is not existent");
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('appType') &&
	                             args.hasOwnProperty('section'));
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.resourcesInSection] error - Invalid args");
		return;		
	}

	SectionMaterial.findAllMaterialsInSection( args, function( error, sectionMaterials ){
		if ( error ){
			console.log("[SectionMaterial.findALlMaterialsInSection] error - "+error);
			callback( null, new Array());
			return;
		}
		var resourcesInSection = new Array();
		var i = sectionMaterials.length - 1;
		for(; i >= 0; i-- ){
			resourcesInSection.push(sectionMaterials[i].material);
		}

		Resource.findAll({ where : { uuid : resourcesInSection }}).success(function( resources ){
			var retResources = new Array();
			var x = resources.length - 1;
			for( ; x >= 0; x-- ){
				retResources.push( resources[x] );
			}

			//search for resource uuids in ES, friggin circular dependency
			require('./queryES.js').getAllQuestionsByUuids(resourcesInSection, args.appType, function(err, result){
				if(result){
					retResources.push.apply(retResources, result);
					callback(null, retResources);
				}else{
					console.log("[QueryES.getAllQuestionsByUUIDS] error - "+ err);
					callback( err, retResources );
				}
			});

		}).error(function(error){
			console.log("[Resource.findall] error - "+error);
			callback( null, new Array() );
			return;
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
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.numberOfResourcesInCourse] error - Args is not existent");
		callback( null, 0 );
		return;
	}
	var containsAllProperties = args.hasOwnProperty('course');
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.numberofResourcesInCourse] error - Invalid args");
		callback( null, 0 );
		return;		
	}

	CourseSection.sectionsInCourse( args, function( error, courseSections ){
		if ( error ) {
			console.log("[CourseSection.sectionsInCourse] error - "+error);
			callback( error, 0 );
			return;
		}
		args.section = courseSections;
		SectionMaterial.findAllMaterialsInSection( args, function( error, sectionMaterials ){
			if ( error ) {
				console.log("[CourseSection.findAllMaterialsInSection] error - "+error);
				callback( error, 0 );
				return;
			}
			else {
				callback( null, sectionMaterials.length );
			}
		});
	});
}
/*
	args = {
		material : UUID of the resource
	}

*/
OrganizationAction.prototype.getSectionTitleByResourceUUID = function( args, callback ){
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.getSectionTitleByResourceUUID] error - Args is not existent");
		callback( null, "" );
		return;
	}
	var containsAllProperties = args.hasOwnProperty('material');
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.getSectionTitleByResourceUUID] error - Invalid args");
		console.log( null, "" );
		return;		
	}
	
	var arg = new Object();
	arg.resource = args.object;
	
	SectionMaterial.findSectionIdByMaterialId( arg, function( error, sectionUUID){
		if ( error){
			console.log("[SectionMaterial.findSectionIdByMaterialId] error - "+error);
			console.log( null, "" );
			return;
		}
		else if ( sectionUUID ) {
			arg.uuid = sectionUUID;
			Section.findSectionById( arg, function( error, foundSection ){
				if ( error ){
					console.log("[Section.findSectionById] error - "+error);
					callback( null, "" );
				}
				else if ( foundSection ){
					callback( null, foundSection.title );
				}
				else { // foundSection was null
					console.log("[Section.findSectionById] error - there was no section");
					callback( null, "" );
				}
			}
			
		}
		else{ //sectionUUID was null
			console.log("[SectionMaterial.findSectionIdByMaterialId] error - the section UUID was null");
			callback( null, "" );
		}
	}

}
/*
    Gets list of all of the resources in particular course.
    
	args = {
		course : UUID of course
	}
	
	Returns the of list of resource
*/

OrganizationAction.prototype.getResourcesByCourseUUID = function( args, callback ){
	if ( args === null || args === undefined ){
		console.log("[OrganizationAction.getResourcesByCourseUUID] error - Args is not existent");
		callback( null , new Array());
		return;
	}
	var containsAllProperties = args.hasOwnProperty('course');
		
	if (  !containsAllProperties ){
		console.log("[OrganizationAction.getResourcesByCourseUUID] error - Invalid args");
		callback( null, new Array());
		return;		
	}

	var async = require('async');	
	var resources = [];	

	CourseSection.sectionsInCourse(args, function(error, sectionUUIDs) {
		if ( error ){
			console.log("[CourseSection.sectionsInCourse] error - "+error);
			callback( null, new Array());
			return;
		}	
		else if(sectionUUIDs){									
			async.forEach(sectionUUIDs, function(sectionUUID, callback) {												
				SectionMaterial.findAllMaterialsInSection({section:sectionUUID}, function(error, sectionMaterial) {
					if ( error ){
						console.log("[SectionMaterial.findAllMaterialsInSection] error - "+error);
						callback( null , new Array());
						return;
					}
					async.forEach(sectionMaterial, function(resourceID, callback) {						
						var Resource = require('../models/resource.js');
						Resource.getResourceByUUID(resourceID.material, function(error, resource) {	
							if ( error ){
								console.log("[Resource.getResourceByUUID] error - "+error);
								callback( new Object(), null );
							}
							else {										
								resources.push(resource);	
								// once the result is retrieved pass it to the callback
								callback( null, resource );	
							}																											
						})
					}, function(err, results){					    
					    // passed the result to outer loop
					    if( err ){
					    	console.log("[SectionMaterial.findAllMaterialsInSection] error - "+err);
					    	callback( null, new Array());
					    }
					    else {
					    	callback( null, results);
					    }
					});									
				})				
			}, function(err, results){
				if ( err ){
					console.log("[CourseSection.sectionsInCourse] error - "+err);
					callback( null, new Array());
					return;
				}
				else {
			    // pass the completed result to a callback			    
			    callback(null, resources);
			    }
			});										
		}
	});
}

module.exports = new OrganizationAction;
