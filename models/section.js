var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var UUID = require('com.izaakschroeder.uuid');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"]
	}
);

var Section = exports.Section = db.define('Section', {
	uuid: {type: Sequelize.STRING, allowNull: false},
	title: {type: Sequelize.STRING, allowNull: false},
	app  : {type: Sequelize.INTEGER, allowNull: false}
});

/*

	Create a new section 
	
	args = {
		sections   : UUIDs of sections currently associatd with the current course
		title  : title of the new section
		app    : ID of the app
	}
	
	returns the UUID of the new section
*/
exports.createSection = function( args, callback ){
	Section.find({ where : { uuid : args.sections, title : args.title }}).success(function( section ){
		if ( null === section ){
			var newUUID = UUID.generate();
			Section.create({ uuid : newUUID, title : args.title, app : args.app }).error(function(error){
				callback(error, null );
			}).success(function( newSection){
				callback( null, newSection );
			});
		}
		else {
			callback(" The section already exists with this course", null );
		}
	}).error( function( error ){ // error block -  Section.findAll 
		callback( error, null );
	});
}

/*
    To remove a section.
    
	args = {
		section = UUID of section to be removed 
	}
	
	returns strings based on if it worked or not 
*/
exports.removeSection = function( args, callback ){
	Section.find({ where : { uuid : args.section }}).success(function(sectionToBeRemoved){
		if ( null === sectionToBeRemoved ){
			callback("This section does not exist " + args.section , null );
		}
		else {
			sectionToBeRemoved.destroy().error(function(error){
				callback(error, null);
			}).success( function ( removedSection ){
				
			callback( null,sectionToBeRemoved);
			});
		}
	});
}

/*
    To find one section which matches the given section UUID and title 
    
	args = {
		section : UUIDs of all of the sections belonging to a specific course
	}
	returns the section which matchces the section UUID and section title
*/
exports.findSection = function( args, callback ){
	Section.find({ where : { uuid : args.section }}).success(function( section ){
		callback( null, section );
	}).error( function ( error ){
		callback( error, null );
	});
} 
/*
	To update the section 
	
	args = {
		section : UUID of the section
		title   : new title 
	}	
	
	returns the section which was updated.
*/

exports.updateSection = function( args, callback ){
	Section.find({ where : { uuid : args.section }}).success(function( section ){
		section.updateAttributes({ title : args.title }).error(function(error ){
			callback( error, null );
		}).success( function ( section ){
			callback( null, section );
		});
		
	});
}