//Comment Model
var Comment = function(target_uuid, user, objectType, body){
	//this.id = uuid;
	this.target_uuid = target_uuid;
	this.user = user;
	this.upvote = 0;
	this.downvote = 0;
	this.body = body;
	this.objectType = objectType;
	this.commentParent = '';
}

module.exports = Comment;