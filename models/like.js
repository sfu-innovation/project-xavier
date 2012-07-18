var fs      = require("fs")
var config  = JSON.parse(fs.readFileSync("config.json"));
var Sequelize = require('sequelize');
var Resource = require(__dirname + '/resource.js').Resource;
var db = new Sequelize(
	config.mysqlDatabase["db-name"],	
	config.mysqlDatabase["user"],
	config.mysqlDatabase["password"],
	
	{
		port: config.mysqlDatabase["port"],
		host: config.mysqlDatabase["host"],		
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
				Resource.find({where:{uuid: resourceUUID}}).success(function(resource){
					var likeCount = resource.likes + 1;
					resource.updateAttributes({likes: likeCount}).success(function(result){
						callback(null, result);
					}).error(function(error){
						callback(error, null);
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