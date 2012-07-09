/* based on this comment schema	
	{
	"user":"mkn3",
	"upvote":"0",
	"downvote":"0",
	"body":"The answer to your question is...",
	"questionIDs":"pJfznhheQuOicWWAjx7F00",
	"timestamp":"2012-06-30"
	}
*/	

//Comment Model
var Comment = function(target_uuid, user, objectType, title, body){
	//this.id = uuid;
	this.target_uuid = target_uuid;
	this.user = user;
	this.upvote = 0;
	this.downvote = 0;
	this.title = title;
	this.body = body;		
	this.objectType = objectType;
	this.isAnswered = 'false';
}

module.exports = Comment;