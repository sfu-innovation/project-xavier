var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
//var Resource = require(__dirname + '/resource.js').Resource;
var Notification = require(__dirname + '/../controller/NotificationAction.js');
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


var Like = exports.Like = db.define('Like', {
	user: {type: Sequelize.STRING, allowNull:false},
	resource: {type: Sequelize.STRING, allowNull:false}
});


//Returns the liked resource on success
exports.likeResource = function(userUUID, resourceUUID, callback){
	Like.find({where:{user:userUUID, resource: resourceUUID}}).success(function(like){
		if(like){
			callback("You have already liked this resource", null);
		}
		else{
			Like.create({user:userUUID, resource: resourceUUID}).success(function(like){
				var Resource = require(__dirname + '/resource.js').Resource;  // doesn't work when define on the top, no idea why
				Resource.find({where:{uuid: resourceUUID}}).success(function(resource){
					var likeCount = resource.likes + 1;
					resource.updateAttributes({likes: likeCount}).success(function(result){

						callback(null,result);

						//notification has nothing to do with user who post the comments
						//don't block them, run it in background.

//
//						var args = {
//							user : userUUID,
//							target : resourceUUID,
//							app    :2,
//							origin: userUUID,
//							description: "someone liked your article"
//						}
//
//						Notification.addLikeUserNotification(args, function(error){
//							if(error)
//								console.log("addLikeUserNotification Failed" + error);
//
//							Notification.addLikeNotifier(args, function(error, result){
//								if(error)
//									console.log("addLikeNotifier Failed" + error);
////									return callback(error);
////
////								callback(null, result);
//							})
//						})
					}).error(function(error){
							callback(error,null);
					})
				}).error(function(error){
					callback(error, null);
				})
			}).error(function(error){
				console.log(error);
				callback(error, null);
			})
		}
	}).error(function(error){
		callback(error, null);
	})
}

//Returns the unliked resource on success
exports.unlikeResource = function(userUUID, resourceUUID, callback){
	Like.find({where:{user:userUUID, resource: resourceUUID}}).success(function(like){
		if(like){
			like.destroy().success(function(result){
				var Resource = require(__dirname + '/resource.js').Resource;   // doesn't work when define on the top, no idea why
				Resource.find({where:{uuid: resourceUUID}}).success(function(resource){
					var likeCount = resource.likes - 1;
					resource.updateAttributes({likes: likeCount}).success(function(result){
						callback(null, result);
					}).error(function(error){
						callback(error, null);
					})
				}).error(function(error){
					callback(error, null);
				})
			}).error(function(error){
				callback(error, null);
			})
		}
		else{
			callback("No like for that resource", null);
		}
	}).error(function(error){
		callback(error, null);
	})
}


exports.isResourceLiked = function(args,callback){
	Like.find({where:{user:args.user, resource:args.resource}}).success(function(result){
		callback(null,result);






	}).error(function(error){callback(error, null);});

}