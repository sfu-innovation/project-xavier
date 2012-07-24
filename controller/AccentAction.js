var TagAction  = require(__dirname + "/TagAction.js");
var queryES    = require(__dirname + "/queryES.js");

exports.getConversationByMedia = function(userID, mediaID, callback){
	TagAction.getQuestionsByMedia(mediaID, function(error, mediaQuestions){
		var allQuestions = mediaQuestions;
		//get Users questions
		queryES.getAllQuestionByUserID(userID, undefined, 1, function(error, result){
			if(!error){
				queryES.getAllCommentByUserID(userID, undefined, 1, function(error, comments){
					if(!error){
						var userQuestions = result.hits;
						var userConversations = [];

						var uuids = [];
						for(i in userQuestions){
							uuids.push(userQuestions[i]._id);
						}
						for(i in comments.hits){
							uuids.push(comments.hits[i]._source.target_uuid);
						}

						allQuestions = allQuestions.filter(function(el){
							if(contains(uuids, el._id)){
								userConversations.push(el);
								return false;
							};
							return true;
						});

						callback(null, allQuestions, userConversations);
					}
					else{
						callback(error, null, null);
					}
				})
			}
			else{
				callback(error, null, null);
			}

		});
	});
}


var contains = function(a, b) {
    for (i in a) {
        if (b === a[i]) {
            return true;
        }
    }
    return false;
}