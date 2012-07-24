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
		},
		
		"Retrieve User Notifications by User on Target ": function( test ){
			var testArg = {
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				event :1,
				app   : 1
			}
			var retrievalArg = {
				user   : 'aka87',
				app    : 1,
				target : 'A7S7FHGA7SD11A7SDF8AS87G'
			}
			
			UserNotification.findAllUserNotifications( null , function( error, results ){
				test.ok( results.should.have.lengthOf(6));
				NotificationAction.removeUserNotificationsByUserAndTarget( retrievalArg, function ( error, removedResults ){
					test.ok( removedResults.should.have.lengthOf(2));
					NotificationAction.removeUserNotificationsByUserAndTarget( retrievalArg, function ( error, removedResults ){
						test.ok( removedResults.should.have.lengthOf(0));
						UserNotification.findAllUserNotifications( null , function( error, results3 ){
							if ( results3 ) {
								test.ok( results3.should.have.lengthOf(4));
							test.done();
							}
						});
					});
					
					
				});
			});
			// we first want to see how many user notificatiosn on that target this user has
			// then remove them, making sure to retain the notifications to be read out later
			// we want to check out how many user notificatons on that target that user now has.
			// and finally print out the removed user notifications
		},
		"Retrieve User Notifications by User": function(test ){
			var args = {
				user : 'aka87',
				app  : 1
			}
			UserNotification.findAllUserNotifications( null , function( error, results ){
				if ( error ){
				}
				test.ok( results.should.have.lengthOf(6));
				NotificationAction.removeUserNotificationsByUser( args, function( error, results ){
					test.ok( results.should.have.lengthOf(2));
					NotificationAction.removeUserNotificationsByUser( args, function( error, results ){
						test.ok( results.should.have.lengthOf(0));
						UserNotification.findAllUserNotifications( null , function( error, results ){
							test.ok( results.should.have.lengthOf(4));
							test.done();
						});
					});
				});
			});
		},
		"Remove a notifier ": function(test){
			var args2 = {
				user : 'aka87',
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				app  : 1
			}
			NotificationListener.findEveryNotificationListener( null, function( error, results ){
				test.ok( results.should.have.lengthOf(10));
				NotificationAction.removeCommentNotifier( args2, function( error, removedNotifier ){
					if ( error ){
						console.log ("*** "+ error );
					}
					if ( removedNotifier ){
						NotificationListener.findEveryNotificationListener( null, function( error, results ){
							test.ok( results.should.have.lengthOf(9));
							test.done();	
						});
					}
				});
			});
		},
		"Create a new resource ": function(test){
			var args = {
				user :  'mak10',
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				app :    2
			}
			
			NotificationListener.findEveryNotificationListener( null, function( error, results ){
				test.ok( results.should.have.lengthOf(10));
				NotificationAction.createNewResource( args, function( error, results ){
					NotificationListener.findEveryNotificationListener( null, function( error, results ){
						test.ok( results.should.have.lengthOf(13));
						test.done();
					});
				});
				
				
			});
		},
		"Create a new question": function( test ){
			var args = {
			    user :  'mak10',
				target : 'A7S7FHGA7SD11A7SDF8AS87G',
				app : 2
			}
			NotificationListener.findEveryNotificationListener( null, function( error, results ){
				test.ok( results.should.have.lengthOf(10));
				NotificationAction.createNewQuestion( args, function( error, results ){
					NotificationListener.findEveryNotificationListener( null, function( error, results ){
						test.ok( results.should.have.lengthOf(11));
						test.done();
					});
				});
			});
		},
		"Update User notification Settings": function(test){
			var args = {
					user: 'aka87',
					app : 1,
				  	notificationOnNewResource : 3,
  					notificationOnLike     : 3,
  					notificationOnComment  : 3,
  					notificationOnStar     : 3
			}
			UserNotificationSettings.findNotificationSettings( args, function( error , setting ){
				test.ok( setting.should.have.property('notificationOnNewResource', 0));
				test.ok( setting.should.have.property('notificationOnLike', 1));
				test.ok( setting.should.have.property('notificationOnComment', 3));
				test.ok( setting.should.have.property('notificationOnStar', 2));
				args.usernotificationsettings = setting;
				NotificationAction.updateUserNotificationSettings( args, function( error, updatedSetting ){
					if ( error ){
						console.log("$@#$ "+ error );
					}
					test.ok( updatedSetting.should.have.property('notificationOnNewResource', 3));
					test.ok( updatedSetting.should.have.property('notificationOnLike', 3));
					test.ok( updatedSetting.should.have.property('notificationOnComment', 3));
					test.ok( updatedSetting.should.have.property('notificationOnStar', 3));
					test.done();
				});
			});
		},	
		"Create User Notification Settings": function(test){
			var args = {
				user : 'aka87',
				app : 0
			}
			UserNotificationSettings.findAllNotificationSettings( null, function( error, settings){
				test.ok( settings.should.have.lengthOf(3));
				
				NotificationAction.createUserNotificationSettings( args, function( error, newNotificationSettings){
					if ( error ){
						console.log( error );
					} else {
						UserNotificationSettings.findAllNotificationSettings( null, function( error, settings2){
							test.ok( settings2.should.have.lengthOf(4));
							test.done();
						});
					}
				});
			});
		},
		"Add course listeners to students":function(test){
			var args ={
				target : 'A827346H7ASDFG9',
				app    : 2
			}
			NotificationListener.findEveryNotificationListener( null, function( error, results ){
				test.ok( results.should.have.lengthOf(10));
				NotificationAction.setupCourseMaterialNotifiers( args, function( error, notifiers ){
					NotificationListener.findEveryNotificationListener( null, function( error, results ){
						test.ok( results.should.have.lengthOf(18));
						test.done();
					});
				});
			});
		}
	}
}