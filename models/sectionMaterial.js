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
});

/*
    To remove all materials from a section 
    
	args = {
		sectionmaterials : section material objects to be removed
	}
	
	returns section material objects that were removed
*/
exports.removeAllMaterialFromSection = function( args, callback ){
	if ( 0 === args.sectionmaterials.length ){
		callback( "there were no section materials to remove from the section", null );
		return;
	}
	var i = args.sectionmaterials.length - 1;
	for(; i >= 0; i--){
		args.sectionmaterials[i].destroy().error( function ( error ){
			callback( error, null );
		});
	}
	callback( null, args.sectionmaterials);
}
/*
	Remove a specific sectionmaterial from a section
	
	args = {
		sectionMaterial : the section material object to remove
	}
*/

exports.removeMaterialFromSection = function( args, callback ){
	if ( null === args.sectionMaterial ){
		callback(" the section material was null ", null );
		return;
	}
	args.sectionMaterial.destroy().error(function(error){
		callback(error, null );
	});
	callback( null, args.sectionMaterial );
}
	
/*
    To find if a specific material/resource is associated with a target section
	args = {
		resource : UUID of the resource to add
		section  : UUID of the section to associate the resource to
	}
	
	returns the specific material/resource if it is found
*/
exports.findAMaterialInSection = function( args, callback ){
	SectionMaterial.find({ where : { material : args.resource, section  : args.section }}).success( function ( sectionMaterial ){
		callback( null, sectionMaterial );
	}).error(function(error){
		callback( error, null );
	});
}

/*
    Get all of the materials in a section 
    
	args = {
		section : UUID of the section
	}
	
	returns all of the materials associated with a section
*/
exports.findAllMaterialsInSection = function( args, callback ){
	SectionMaterial.findAll({ where: { section : args.section }}).success(function(sectionmaterials){
		callback( null, sectionmaterials );
	}).error(function(error){
		callback( error, null );
	});
}

/*
	To create a new section material 
	
	args = {
		section : UUID of the section
		resource : UUID of the resource
	}
	
	returns the sectionmaterial created unless there is an error
*/
exports.createSectionMaterial = function( args, callback ){
	SectionMaterial.create({ section : args.section, material : args.resource}).success( function ( savedMaterial ){
		callback( null, savedMaterial );
	}).error( function ( error ){
		callback( error, null );
	});
}
	
/*
	To update a single sectionMaterial to a new section
	
	args = {
		newsection : UUID of new section
		sectionmaterial = section material object to move
	}
	
	returns the move section material
*/
exports.updateSectionMaterial = function( args, callback ) {
    args.sectionmaterial.updateAttributes({ section : args.newsection }).error(function(error ){
		callback( error, null );
	}).success(function(updatedSectionMaterial){
		callback( null, updatedSectionMaterial );
	});
    
}
    