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
				listener : 'B857342H7ASDF07'
		    }
		    UserNotification.selectUserNotifications( args, function(error, userNotifications ){
		    	test.ok(userNotifications.should.have.lengthOf(1));
		    	test.done();
		    });
		    
		},
		  "Select user notifications for specific user": function(test){
				args = {
					listener : 'B857342H7ASDF07',
					user     : 'A7S7F8GA7SD11B7SDF8ASD7G'
				}
				
			 UserNotification.selectUserNotificationsForUser( args, function(error, userNotifications ){
		    	test.ok(userNotifications.should.have.lengthOf(1));
		    	test.done();
		    });
		},
		
		
	   "Remove User Notification ":function(test){
			args = {
				listener : 'B857342H7ASDF07',
				user     : 'A7S7F8GA7SD11B7SDF8ASD7G'
			}
				
			 UserNotification.selectUserNotificationsForUser( args, function(error, userNotifications ){
			 	args.usernotification = userNotifications[0];
		    	UserNotification.removeUserNotification( args, function(error, removedUserNotification){
		    		UserNotification.selectUserNotificationsForUser( args, function(error, userNotifications ){
		    			if ( 0 === userNotifications.length ){
		    				test.done();
		    			}
		    		});
		    	});
		    });
		},
		
		"Create User Notification ":function(test){
			
			args = {
				listener    : "B857342H7ASDF01",
		        user        : "A7S7F8GA7SD11A7SDF8ASD7G",
		        description : "test description 345",
		        app         : 2
			}
			UserNotification.createUserNotification( args, function(error, newUserNotification ){
				args.listener = newUserNotification.listener;
				UserNotification.selectUserNotificationsForUser( args, function(error, userNotifications ){
		    		test.ok( userNotifications.should.have.lengthOf(2));
		    		test.done();
		    	});
			});
		} 
	}
}