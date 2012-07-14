var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');

var OrganizationAction = require('../../../controller/OrganizationAction.js');
var SectionMaterial    = require('../../../models/sectionMaterial.js');
var CourseSection      = require('../../../models/courseSection.js');
var Section            = require('../../../models/section.js');

module.exports = {

	userTests:{
		
		setUp: function(callback){
			queries.dropDB(config.mysqlDatabase["db-name"], function(){
				queries.createDB(config.mysqlDatabase["db-name"], function(){
					queries.insertData(
						'./database/test-data.json'
						, config.mysqlDatabase["db-name"]
						, config.mysqlDatabase["user"]
						, config.mysqlDatabase["password"]
						, config.mysqlDatabase["host"]
						, callback
					);
				});
			});
		},
		tearDown: function(callback){
			queries.dropDB(config.mysqlDatabase["db-name"], function(){
				callback();
			});
		},
		
		"Add Resource To Section" : function( test ){
			var args = {
				section : 'A827346H7ASDFG9',
				resource : 'A7S7FHGA7SD11A7SDF8ASD7G'
			}
			SectionMaterial.findAllMaterialsInSection( args, function( error, materials ){
				test.ok(materials.should.have.lengthOf(0));
				OrganizationAction.addResourceToSection( args, function(error, newMaterialInSection ){
					SectionMaterial.findAllMaterialsInSection( args, function( error, materials ){
						test.ok(materials.should.have.lengthOf(1));
						test.done();
					})
				});
			});
		},
		"Remove Resource From Section" : function( test ){
			var args = {
				section : 'A827346H7ASDFG9',
				resource : 'A7S7FWGA7SD11A7SDF8ASD7G'
			}
			SectionMaterial.findAllMaterialsInSection( args, function( error, materials ){
				test.ok(materials.should.have.lengthOf(0));
				OrganizationAction.removeResourceFromSection( args, function(error, newMaterialInSection ){
					SectionMaterial.findAllMaterialsInSection( args, function( error, materials ){
						test.ok(materials.should.have.lengthOf(0));
						test.done();
					})
				});
			});
		},
		"Update Resource From Section To Section" : function( test ){
			args = {
				section : 'A827346H7AFSSFG9',
				newsection : 'A412341H7AFSSFG9',
				resource : 'A7S7FWGA7SD11A7SDF8ASD7G'
			}
			SectionMaterial.findAMaterialInSection( args, function( error, material ){
				test.ok(material.should.have.property('section', 'A827346H7AFSSFG9'));
				OrganizationAction.updateResourceFromSectionToSection( args, function( error, updatedResource ){
					test.ok(updatedResource.should.have.property('section', 'A412341H7AFSSFG9'));
					test.done();
				});
			});
		},
		"Add Section" : function( test ){
			args = {
				course : 'A827346H7ASDFG9',
				title  : 'best section ever',
				app    :  2
			}
			CourseSection.sectionsInCourse( args, function( error, sectionUUIDs ){
				test.ok(sectionUUIDs.should.have.lengthOf(3));
				OrganizationAction.addSection(args, function(error, newSection){
					console.log( newSection );
					CourseSection.sectionsInCourse( args, function( error, sectionUUIDs ){
						test.ok(sectionUUIDs.should.have.lengthOf(4));
						test.done();
					});
				});
			});
		},
		"Remove Section" : function( test ){
			args = {
				course : 'A8G7S6H7ASDFG9',
				section : 'A827341H7AFFFFG9'
			}
			CourseSection.sectionsInCourse( args, function( error, sectionUUIDs ){
				test.ok(sectionUUIDs.should.have.lengthOf(1));
				OrganizationAction.removeSection(args, function(error, newSection){
					CourseSection.sectionsInCourse( args, function( error, sectionUUIDs ){
						test.ok(sectionUUIDs.should.have.lengthOf(0));
						test.done();
					});
				});
			});
		}, 
		"Update Section" : function( test ){
			var args = {
				sections : 'A827346H7AFSSFG9',
				title : 'section description 1',
				newtitle : 'super duper section',
				course : 'A827346H7ASDFG9'
			}
			Section.findSection( args, function( error, sectionObj ){
				test.ok(sectionObj.should.have.property('title', 'section description 1'));
				OrganizationAction.updateSection( args, function( error, updatedSection ){
					console.log( args);
					console.log( error );
					test.ok(updatedSection.should.have.property('title', 'super duper section'));
					test.done();
				});
			});
			
		},
		"Sections in Course" : function( test ){
			var args = {
				course : 'A827346H7ASDFG9'
			}
			
			OrganizationAction.sectionsInCourse( args, function( error, sections ){
				test.ok(sections.should.have.lengthOf(1));
				test.done();
			});
		}, 
		
		"Materials in Section " : function(test){
			var args = {
				section : 'A827346H7AFSSFG9'
			}
			OrganizationAction.resourcesInSection(args, function(error, resources){
				test.ok(resources.should.have.lengthOf(2));
				test.done();
			});	
		}, 
		"Number of Resources in Course":function(test){
			var args = {
				course : 'A827346H7ASDFG9'
			}
			OrganizationAction.numberOfResourcesInCourse( args, function( error, numOfResources){
				test.ok(numOfResources.should.equal(2));
				test.done();
			});
		}
		
	}
}