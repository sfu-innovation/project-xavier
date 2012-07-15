var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');

var NotificationAction       = require('../../../controller/NotificationAction.js');
var NotificationListener     = require('../../../models/notificationListener.js');
var UserNotification         = require('../../../models/userNotification.js');
var UserNotificationSettings = require('../../../models/userNotificationSettings.js');

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
		
		/*"Add Notification Listener" : function( test ){
			var args = {
				user : 'AQWRHIQWDQIO8424RQHEIO2',
				target : 'ADAD32F3E1E21EW',
				event : 0,
				app   : 2
			}
			NotificationListener.findNotificationListener( args, function( error, listener) {
				NotificationAction.addNotifier( args, function( error, newListener){
				console.log( newListener );
					NotificationListener.findNotificationListener( args, function( error, listener) {
						test.ok( listener.should.have.property('user', 'AQWRHIQWDQIO8424RQHEIO2'));
						test.ok( listener.should.have.property('target', 'ADAD32F3E1E21EW'));
						test.done();
					});
				});
			});
		},
		
		"Remove Notification Listener" : function( test ){
			var args = {
				user : 'A7S7F8GA7SD11A7SDF8ASD7G',
				target : 'B857346H7ASDFG9',
				event : 0
			}
			NotificationListener.findNotificationListener( args, function( error, listener ){
				test.ok( listener.should.have.property('user', 'A7S7F8GA7SD11A7SDF8ASD7G'));
				test.ok( listener.should.have.property('target', 'B857346H7ASDFG9'));
				NotificationAction.removeNotifier( args, function( error, removedListener ){
					NotificationListener.findNotificationListener( args, function( error, listener ){
						if ( null === listener ){
							test.done();
						}
					});
				});
			});
				
		}, */
		/*"Add User Notification" : function( test ){
			args = {
				listener    : 'B827346H7ASDFG9',
				target      : 'B857346H7ASDFG9',
				user        : 'A7S7F8GA7SD11A7SDF8ASD7G',
				app         : 1,
				event       : 0,
				description : 'Alex is testing  a notification for the add user notification test'
			}
			UserNotification.selectUserNotificationsByListener( args, function( error, notifications ){
				NotificationAction.addUserNotification( args, function( error, newNotifications ){
					UserNotification.selectUserNotificationsByListener( args, function( error, notifications ){
						test.ok( notifications.should.have.lengthOf(1));
						var notification = notifications[0];
						test.ok( notification.should.have.property('description',
						 'Alex is testing  a notification for the add user notification test'));
						test.done();
					});
				});
			});
		},*/
	/*	"Remove User Notifications" : function( test ){
			args = {
				course : 'A827346H7ASDFG9',
				title  : 'best section ever',
				app    :  2
			}
			NotificationAction.removeUserNotifications( args, function(error, removedNotifications){
				target : The resource which incurred an event for this user notification to be created,
				event : The event which caused this user notification to be created ,
				user : The user to be notified by the notification listener 
			});
		},*/
		/*"Remove Section" : function( test ){
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
		}*/
		
	}
}