var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var SectionMaterial = require('../../../models/sectionMaterial.js');

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
		
		"Find Materials in Section": function(test){
		    var args = {
		    	section : "A827346H7ASDFG9"
		    }
		    
			SectionMaterial.findAllMaterialsInSection(args, function( error, sectionMaterials ){
				test.ok(sectionMaterials.should.have.lengthOf(2));
				test.done();
			});
		}, 
	
		"Find Material in Section": function(test){
			var args = {
				resource : 'A7S7FWGA8SD11A7SDF8ASD7G',
				section  : 'A827346H7ASDFG9'
			}
			
			SectionMaterial.findAMaterialInSection(args, function( error, sectionMaterial ){
				console.log(sectionMaterial);
				test.ok(sectionMaterial.should.have.property('material','A7S7FWGA8SD11A7SDF8ASD7G' ));
				test.ok(sectionMaterial.should.have.property('section', 'A827346H7ASDFG9'));
				test.done();	
			});
			
		},
		
		"Create Section Material" : function( test ){
			var args = {
				section : 'A827346H7ASDFG9',
				resource : 'A7S7FWGA8SD11A7SDF8ASD7G'
			}
			var args2 = {
		    	section : "A827346H7ASDFG9"
		    }
		    
			SectionMaterial.findAllMaterialsInSection(args2, function( error, sectionMaterials ){
				test.ok(sectionMaterials.should.have.lengthOf(2));
			});
			SectionMaterial.createSectionMaterial( args, function( error, newSectionMaterial ){
				test.ok(newSectionMaterial.should.have.property('material','A7S7FWGA8SD11A7SDF8ASD7G' ));
				test.ok(newSectionMaterial.should.have.property('section', 'A827346H7ASDFG9'));
				SectionMaterial.findAllMaterialsInSection(args2, function( error, sectionMaterials ){
					test.ok(sectionMaterials.should.have.lengthOf(3));
					test.done();
				});
			});
		},
		
		"Update Section Material" : function( test ){
		
			var args = {
				newsection : 'A827341H7AFFFFG9'
			}
			var args2 = {
				resource : 'A7S7FWGA8SD11A7SDF8ASD7G',
				section  : 'A827346H7ASDFG9'
			}
			var args3 = {
				resource : 'A7S7FWGA8SD11A7SDF8ASD7G',
				section  : 'A827341H7AFFFFG9'
			}
			
			SectionMaterial.findAMaterialInSection(args2, function( error, sectionMaterial ){
				test.ok(sectionMaterial.should.have.property('material','A7S7FWGA8SD11A7SDF8ASD7G' ));
				test.ok(sectionMaterial.should.have.property('section', 'A827346H7ASDFG9'));
				args.sectionmaterial = sectionMaterial;
				SectionMaterial.updateSectionMaterial( args, function( error, sectionMaterial2 ){
					SectionMaterial.findAMaterialInSection(args3, function( error, sectionMaterial3 ){
						test.ok(sectionMaterial3.should.have.property('material','A7S7FWGA8SD11A7SDF8ASD7G' ));
						test.ok(sectionMaterial3.should.have.property('section', 'A827341H7AFFFFG9'));
						test.done();	
					});
				});
			});
			
		},
		"Remove a Section Material":function(test){
			var args = {
		    	section : "A827346H7ASDFG9"
		    }
		    
			SectionMaterial.findAllMaterialsInSection(args, function( error, sectionMaterials ){
				test.ok(sectionMaterials.should.have.lengthOf(2));
				var args1 = {
					resource : 'A7S7FWGA8SD11A7SDF8ASD7G',
					section  : 'A827346H7ASDFG9'
				}
				SectionMaterial.findAMaterialInSection(args1, function( error, sectionMaterial ){
					test.ok(sectionMaterial.should.have.property('material','A7S7FWGA8SD11A7SDF8ASD7G' ));
					test.ok(sectionMaterial.should.have.property('section', 'A827346H7ASDFG9'));
					args.sectionMaterial = sectionMaterial;
					SectionMaterial.removeMaterialFromSection( args, function( error, removedSection ){
					 	var args2 = {
		    				section : "A827346H7ASDFG9"
		    			}
						SectionMaterial.findAllMaterialsInSection(args2, function( error, sectionMaterials ){
							test.ok(sectionMaterials.should.have.lengthOf(1));
							test.done();
						});
					});	
				});
			});
		}, 
		"Remove Section Materials":function(test){
			var args = {
		    	section : "A827346H7ASDFG9"
		    }
		    
			SectionMaterial.findAllMaterialsInSection(args, function( error, sectionMaterials ){
				test.ok(sectionMaterials.should.have.lengthOf(2));
				var args1 = {
					sectionmaterials : sectionMaterials
				}
				SectionMaterial.removeAllMaterialFromSection(args1, function( error, sectionMaterial ){
					 var args2 = {
		    			section : "A827346H7ASDFG9"
		    		}
					SectionMaterial.findAllMaterialsInSection(args2, function( error, sectionMaterials ){
						test.ok(sectionMaterials.should.have.lengthOf(0));
						test.done();
					});
				});
			});
		}
	}
}