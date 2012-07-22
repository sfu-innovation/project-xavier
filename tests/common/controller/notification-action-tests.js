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
		
		"Add Notification Listener" : function( test ){
			var args = {
				user : 'mak10',
				target : 'A7S7FHGA7SD11A7SDF8ASD7G',
				event : 0,
				app   : 2
			}
			NotificationListener.findNotificationListener( args, function( error, listener) {
				NotificationAction.addNotifier( args, function( error, newListener){
					NotificationListener.findNotificationListener( args, function( error, listener) {
						test.ok( listener.should.have.property('user', 'mak10'));
						test.ok( listener.should.have.property('target', 'A7S7FHGA7SD11A7SDF8ASD7G'));
						test.done();
					});
				});
			});
		},
		
		
		"Remove Notification Listener" : function( test ){
			var args = {
				user : 'aka87',
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				event : 1,
				app : 1
			}
			NotificationListener.findNotificationListener( args, function( error, listener ){
				test.ok( listener.should.have.property('user', 'aka87'));
				test.ok( listener.should.have.property('target', 'A7S7FHGA7SD11A7SDF8AS87G'));
				args.listener = listener.uuid;
				NotificationAction.removeNotifier( args, function( error, removedUserNotifications ){
					
					NotificationListener.findNotificationListener( args, function( error, listener ){
						if ( null === listener ){
							test.done();	
												
						}
					});
				});
			});
				
		}, 
		"Add User Notification" : function( test ){
			args = {
				target      : 'A7S7FHGA7SD11A7SDF8AS87G',
				app         : 1,
				event       : 1,
				description : 'Alex is testing  a notification for the add user notification test'
			}
				UserNotification.findAllUserNotifications( args, function( error, notifications){
					test.ok(notifications.should.have.lengthOf(6));
				});
				NotificationAction.addUserNotification( args, function( error, newNotifications ){
					NotificationAction.addUserNotification( args, function( error, newNotifications ){
					
					
					if ( newNotifications ){
						test.ok( newNotifications.should.have.lengthOf(3));
						UserNotification.findAllUserNotifications( args, function( error, notifications){
							if( notifications ){
								test.ok(notifications.should.have.lengthOf(12));
							}
						});
						test.done();
					}
					else {
						console.log("ERROR "+ error );
						test.done();
					}
					});
				});
			
		}, 
	   "Remove User Notifications" : function( test ){
			args = {
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				event : 1 ,
				user : 'aka87',
				app  : 1
			}		
			UserNotification.findAllUserNotifications( args, function( error, notifications){
					test.ok(notifications.should.have.lengthOf(6));
				});
			NotificationAction.removeUserNotifications( args, function(error, removedNotifications){
				if ( removedNotifications ){
					UserNotification.findAllUserNotifications( args, function( error, notifications){
					if ( notifications ){
						test.ok(notifications.should.have.lengthOf(5));
					}
				});
					test.done();
				}
			});
		
		},
		
		"Add a like notification" : function( test ){
			args = {
				target      : 'A7S7FHGA7SD11A7SDF8AS87G',
				app         : 1,
				description : 'The message to be delivered in the notification	'
			}
			NotificationAction.addLikeUserNotification( args, function(error, notification){
				if( error ){
					console.log(error);
				}
				if( notification ){
					test.done();
				}
			});
			
		}, 
		"Add a like notifier " : function( test ){
			var testArg = {
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				event :0,
				app   : 2
			}
			var args = {
				user : 'mak10',
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				app   : 2
			}
			NotificationListener.findAllNotificationListeners( testArg, function( error, results){
				test.ok( results.should.have.lengthOf(0));
				NotificationAction.addLikeNotifier( args, function( error, results ){
					NotificationListener.findAllNotificationListeners( testArg, function( error, results2){
						test.ok( results2.should.have.lengthOf(1));
						test.done();
					});
				});
			});	
		}
	}
}