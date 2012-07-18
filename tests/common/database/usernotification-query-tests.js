var should = require('should');
var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var queries = require('../../../database/db-queries.js');
var UserNotification = require('../../../models/userNotification.js');

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
		"Select User Notifications": function(test){
		    var args = {
				listener : 'B827qwwqqza346H7ASDFFSDGQEE'
		    }
		    UserNotification.selectUserNotifications( args, function(error, userNotifications ){
		    	test.ok(userNotifications.should.have.lengthOf(2));
		    	test.done();
		    });
		    
		},
		" Get Daily unsent User Notifications":function(test){
			args = {
				wait : 1
			}
			UserNotification.selectUnsentUserNotificationsByTime( args, function( error, userNotifications){
				test.ok(userNotifications.should.have.lengthOf(2));
				test.done();
			});
		},
		" Set Unsent User Notifications to Sent ":function(test){
			args = {
				wait : 1
			}
			UserNotification.selectUnsentUserNotificationsByTime( args, function( error, userNotifications){
				args.usernotifications = userNotifications;
				UserNotification.markAsSentUserNotifications( args, function( error, updatedUserNotifications){
					console.log( error );
					test.ok(updatedUserNotifications[0].should.have.property('emailSent', true )) ;
					test.ok(updatedUserNotifications.should.have.lengthOf(2));
					test.done();
				});
			});
		},
		
	   "Remove User Notification ":function(test){
			args = {
				listener : 'B827qwwqqza346H7ASDFFSDGQEE'
			}
				
			 UserNotification.selectUserNotifications( args, function(error, userNotifications ){
			 	test.ok( userNotifications.should.have.lengthOf(2));
			 	args.usernotifications = userNotifications;
		    	UserNotification.removeUserNotifications( args, function(error, removedUserNotification){
		    		UserNotification.selectUserNotifications( args, function(error, userNotifications ){
		    			test.ok(userNotifications.should.have.lengthOf(0));
		    			test.done();
		    		});
		    	});
		    });
		},
		
		"Create User Notification ":function(test){
			
			args = {
				listener    : "B857342H7ASDF01",
		        description : "test description 345",
		        emailSent         : false,
				wait              : 2
			}
			
			UserNotification.createUserNotification( args, function(error, newUserNotification ){
				test.ok(newUserNotification.should.have.property('listener', 'B857342H7ASDF01'));
				UserNotification.selectUserNotifications( args, function(error, userNotifications ){
		    		test.ok( userNotifications.should.have.lengthOf(1));
		    		test.done();
		    	});
			});
		} 
	}
}