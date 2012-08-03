var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"],
		logging: false
	}
);

var CourseSection = exports.CourseSection = db.define('CourseSection', {
	course: {type: Sequelize.STRING, allowNull: false},
	section: {type: Sequelize.STRING, allowNull: false},
	app    : { type: Sequelize.INTEGER, allowNull: false}
});

/*
    This will create a course section. It is important that this function not be 
    called explicitly but rather when a section is created. This is because
    the createSection does the adequate checks to ensure the database will be in a good state.
    
	args = {
		course  : UUID of course
		section : UUID of new section
		app     : ID of app
	}
*/
exports.createCourseSection = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = (args.hasOwnProperty('course') && args.hasOwnProperty('section') &&
		args.hasOwnProperty('app') );
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

	CourseSection.create( { course : args.course, section : args.section, app : args.app })
	.success(function(newCourseSection){
		callback( null, newCourseSection );
	}).error(function(error){
		callback( error, null);
	});
}

/*
    This will retrieve all of the sections in a course.
    
	args = {
		course : UUID of course
	}
	
	Returns all of the UUIDs of each section in the course.
*/
exports.sectionsInCourse = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = args.hasOwnProperty('course');
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

	CourseSection.findAll({ where : { course : args.course }}).success( function( courseSections ){
		var sectionID = new Array();
		var i = courseSections.length - 1;
		for (; i >= 0; i--){
			sectionID.push( courseSections[i].section );
		}
		callback( null, sectionID );
		return;
	}).error( function( error ){  // error block - CourseSection.findAll
		callback( error, null );  
	});
}

/*
    Remove association between section and course.
    Since this is a 1 to many relationship between course to section,
    we only need to have the section ID to properly remove
	args = {
		section : UUID of section
	}
*/
exports.removeCourseSection = function( args, callback ){
	if ( args === null || args === undefined ){
		callback("Args is not existent", null);
		return;
	}
	var containsAllProperties = args.hasOwnProperty('section');
		
	if (  !containsAllProperties ){
		callback("Invalid args "+args.value, null );
		return;		
	}

	CourseSection.find({ where : { section : args.section }}).success( function( courseSection ){
		if ( null === courseSection ){
			callback("The section doesn't exist", null );
		}
		else {
			courseSection.destroy().error(function ( error ){
				callback( error, null );
			}).success( function ( removedCourseSection ){
				callback( null, removedCourseSection );
			});
		}
	}).error( function ( error ){
		callback( error, null );
	});	
}