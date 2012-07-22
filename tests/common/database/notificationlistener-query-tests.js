var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var NotificationListener = require('../../../models/notificationListener.js');

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
		"Find All Notification Listeners": function(test){
		  
		    var args = {
		    	app    : 1,
		    	event  : 0,
		    	target : 'A7S7FHGA7SD11A7SDF8AS87G',
		    }
		    
			NotificationListener.findAllNotificationListeners( args, function(error, notificationListeners ){
				if( error ){
					console.log( error );
					test.done();
				}else {
					test.ok(notificationListeners.should.have.lengthOf(1));
					test.done();
				}
				
			});
		},
		
		
		"Find Notification Listener": function(test){
			var args = {
				user    : 'aka87',
		    	event  : 0,
		    	target : 'A7S7FHGA7SD11A7SDF8AS87G',
		    	app     : 1
			}
			
			NotificationListener.findNotificationListener(args, function(error, notificationListener ){
				if ( error ){
					console.log( error );
				}
				
				test.ok( notificationListener.should.have.property( 'user', 'aka87') );
				test.done();
			});
		},
		
		"Create Notification Listener ":function(test){
			args = {
				app : 1,
				user : 'BSDF787D98ASDF099D7G',
				target : 'B857346H7ASDFG9',
				event : 0
			}
			NotificationListener.findAllNotificationListeners( args, function( error, notificationListeners1 ){
				test.ok( notificationListeners1.should.have.lengthOf(0));
				NotificationListener.createNotificationListener( args, function( error, newNotificationListener){
					NotificationListener.findAllNotificationListeners( args, function( error, notificationListeners2 ){
						test.ok( notificationListeners2.should.have.lengthOf(1));
						test.done();
					});
				});
			});
		},
		"Remove Notification Listener ":function(test){
			var args = {
				user    : 'aka87',
		    	event  : 0,
		    	target : 'A7S7FHGA7SD11A7SDF8AS87G',
		    	app    : 1
			}
			
			NotificationListener.findNotificationListener(args, function(error, notificationListener ){
				args.notificationlistener = notificationListener;
				NotificationListener.removeNotificationListener( args, function(error, removedNotificationListener ){
					NotificationListener.findAllNotificationListeners(args, function(error, notificationListeners ){
						if ( error ){
							console.log( error );
							test.done();
						}
						else {
							test.ok( notificationListeners.should.have.lengthOf(0));
							test.done();
						}
						
					});
				});
			});	
		},
		
		"Find Notifications by User and Target ":function(test){
			var args = {
				user    : 'mak10',
		    	target : 'A7S7FHGA7SD11A7SDF8AS87G',
		    	app    : 1
			}
			
			NotificationListener.findAllNotificationListenersByTarget(args, function(error, notificationListeners ){
				test.ok(notificationListeners.should.have.lengthOf(2));
				test.done();
			});
		},
		
		"Find Notifications for specific user ":function(test){
			var args = {
				user    : 'aka87',
		    	app    : 1
			}
			
			NotificationListener.findUserSpecificNotificationListeners(args, function(error, notificationListeners ){
				test.ok(notificationListeners.should.have.lengthOf(6));
				test.done();
			});
		}
	}
}