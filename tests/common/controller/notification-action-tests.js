var should = require('should');
var fs      = require("fs")
var async   = require("async");
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
				user : 'A7S7F8GA7SD98A7SDF8ASD7G',
				target : 'A7S7FHGA7SD11A7SDF8ASD7G',
				event : 0,
				app   : 2
			}
			NotificationListener.findNotificationListener( args, function( error, listener) {
				NotificationAction.addNotifier( args, function( error, newListener){
					NotificationListener.findNotificationListener( args, function( error, listener) {
						test.ok( listener.should.have.property('user', 'A7S7F8GA7SD98A7SDF8ASD7G'));
						test.ok( listener.should.have.property('target', 'A7S7FHGA7SD11A7SDF8ASD7G'));
						test.done();
					});
				});
			});
		},
		
		"Remove Notification Listener" : function( test ){
			var args = {
				user : 'A7S7F8GA7SD11A7SDF8ASD7G',
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				event : 1,
				app : 1
			}
			NotificationListener.findNotificationListener( args, function( error, listener ){
				test.ok( listener.should.have.property('user', 'A7S7F8GA7SD11A7SDF8ASD7G'));
				test.ok( listener.should.have.property('target', 'A7S7FHGA7SD11A7SDF8AS87G'));
				args.listener = listener.uuid;
				NotificationAction.removeNotifier( args, function( error, removedListener ){
					NotificationListener.findNotificationListener( args, function( error, listener ){
						if ( null === listener ){
							test.done();
						}
					});
				});
			});
				
		}, */
	/*	"Add User Notification" : function( test ){
			args = {
				target      : 'A7S7FHGA7SD11A7SDF8AS87G',
				user        : 'A7S7F8GA7SD98A7SDF8ASD7G',
				app         : 1,
				event       : 3,
				description : 'Alex is testing  a notification for the add user notification test'
			}
			
				NotificationAction.addUserNotification( args, function( error, newNotifications ){
					test.done();
				});
			
		*/
	//	test.done(); // cant fucking test it right now.. i know i know.
		//} , 
		
	 /* "Remove User Notifications" : function( test ){
			args = {
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				event : 1 ,
				user : 'A7S7F8GA7SD11A7SDF8ASD7G',
				app  : 1
			}		
			NotificationAction.removeUserNotifications( args, function(error, removedNotifications){
				test.done();
				});
		
		*/
	/*	"Add a like notification" : function( test ){
			args = {
				target      : 'A7S7FHGA7SD11A7SDF8AS87G',
				app         : 1,
				description : 'The message to be delivered in the notification	'
			}
			NotificationAction.addLikeUserNotification( args, function(error, notification){
				test.done();
			});
			
		}, */
		/*"Add a like notifier " : function( test ){
			var args = {
				user : 'A7S7F8GA7SD98A7SDF8ASD7G',
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				app   : 2
			}
			NotificationAction.addLikeNotifier( args, function( error, results ){
				test.done();
			});
			
		},*/
	/*	"Sections in Course" : function( test ){
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