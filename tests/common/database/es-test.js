//TODO: map result to Question model

var queryES = require('../../../controller/queryES.js');
var question = require('../../../models/question.js');
var comment = require('../../../models/comment.js');
var qID = '';
//NOTE**
//for types, 0 = presenter, 1 = accent

//////////////////////////////////////////////////////////////////////////////////////////////////
// Questions 
//////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
	questions:{
		setUp: function(callback){
			callback();
		},
		tearDown: function(callback){
			callback();
		},
//*****************GET a question***********************
//@params: questionID, type, callback
		"getQuestion": function(test){
			queryES.getQuestion('pJfznhheQuOicWWAjx7F00', 0, function(result){
				test.ok(result);
				test.done();
			});
		},
//*****************GET all question*********************
//@params: type, callback
		"getAllQuestions":function(test){
			queryES.getAllQuestions(0, function(result){
				test.ok(result);
				test.done();
			})
		},
//*****************GET all question by user uuid********
//@params: userID, type, callback
		"getAllQuestionsByUserID":function(test){
			queryES.getAllQuestionByUserID('jbo1', 0, function(result){
				test.ok(result);
				test.done();
			})
		},
//*****************SEARCH all based on project type*****
//@params: search query, type, callback
		"searchAll": function(test){
			queryES.searchAll('fuk dwntwn', 0, function(result){
				test.ok(result);
				test.done();
			})
		},
//*****************ADD a question***********************
//Question model takes in userID, title, body, category
//@params: question model, type, callback
		"addQuestion": function(test){
			var q = new question('someUsrUuid', 'The question i ask', 'some description', 'someCategory');
			queryES.addQuestion(q, 0, function(result){
				qID = result._id;
				test.ok(result);
				test.done();
			})
		},
//****************UPDATE question status*******************
//@params: questionID
		"updateQuestion":function(test){
			queryES.updateStatus(qID, 0, function(result){
				test.ok(result);
				test.done();
			})
		},
//*****************FOLLOW a question***********************
//@params: question uuid, user uuid, callback
		"followQuestion": function(test){
			queryES.addFollower(qID, 'newGuy', 0, function(result){
				test.ok(result);
				test.done();
			});
		},
//****************GET questionID by follower**************
//@params: follower ID, type, callback
		"getQuestionByFollowerID":function(test){
			queryES.getQuestionByFollowerID('newGuy', 0, function(result){
				test.ok(result);
				test.done();
			})
		},
//*****************UPDATE a question**********************
//@params: questionID, questionBody, type, callback
		"updateQuestion":function(test){
			queryES.updateQuestion(qID, 'new updated question', 'new description', 0, function(result){
				test.ok(result);
				test.done();
			});
		},
//****************UPDATE question status*******************
//@params: questionID
	"updateQuestion":function(test){
		queryES.updateStatus(qID, 0, function(result){
			test.ok(result);
			test.done();
		})
	},
//*****************DELETE a question***********************
//@params: questionID, type, callback
		"deleteQuestion":function(test){
			queryES.deleteQuestion(qID, 0, function(result){
				test.ok(result);
				test.done();
			})
		}
	}

//////////////////////////////////////////////////////////////////////////////////////////////////
// Comments 
//////////////////////////////////////////////////////////////////////////////////////////////////

//*****************GET a comment***********************
//@params: commentID, type, callback
/*
queryES.getComment('aJfzggggguOicWWAjx7F05', 1, function(result){
	console.log(result);
});
*/

//*****************GET a comment by target_uuid***********************
//@params: target_uuid, appType, callback
/*
queryES.getCommentByTarget_uuid('pJfznhheQuOicWWAjx7F00', 0, function(result){
	console.log('Found: ' + result.total);
	console.log(JSON.stringify(result.hits));
});
*/

//*****************GET all question*********************

//@params: type, callback
/*
 queryES.getAllComment(0, function(result){
 console.log(JSON.stringify(result));
 })
 */

//*****************GET all comments by user uuid********

//@params: userID, type, callback
/*
queryES.getAllCommentByUserID('mcs3', 1, function(result){
	//You should get 2 sets of result
	console.log('Found: ' + result.total);
	console.log(JSON.stringify(result.hits));
})
*/

//*****************ADD a comment***********************
//Comment model takes in (target_uuid, user, objectType, title, body, timestamp)

//var comment = new comment('0226148e-1d4d-4e4d-a54c-9a14486d41bf', 'snsd6', 'presenter', 'About dancing', 'Dancing time...', '2012-05-07');

//@params: comment model, type, callback
/*
queryES.addComment(comment, 0, function(){
	console.log("Comment added, check ES");
});
*/

//*****************UPDATE a comment**********************
//@params: commentID, commentTitle, commentBody, appType, callback
/*
queryES.updateComment('8b67e304-af4b-4d57-a325-0e8b4e7e9237', 'dreamworks', 'shrek', 0, function(result){
	console.log("Comment updated, check ES");
	console.log(result);
});
*/

//*****************DELETE a comment***********************
//@params: commentID, type, callback
/*
queryES.deleteComment('universal', 0, function(result){
	console.log("Comment deleted");
	console.log(result);
})
*/

//*****************Append a commentID to a question***********************
//
// Ignore appendCommentID and deleteCommentID for now.
// This needs to be discussed together.
//
//@params: questionID, commentID, type, callback
/*
queryES.appendCommentID("","", type, function(result) {
	console.log("CommentID appended to the Question");
	console.log(result);
});
*/

//*****************Delete a commentID from a question***********************
//@params: questionID, commentID, callback
/*
queryES.deleteCommentID("","", function(result) {
	console.log("CommentID deleted from the Question");
	console.log(result);
});
*/

//*****************Update comment's vote***********************
//@params: commentID, direction, type, callback
/*
queryES.updateVote('zzz123', 1, 0, function(result) {
	console.log("Comment vote updated");
	console.log(result);
});
*/

//*****************Update comment's isAnswered***********************
//@params: commentID, appType, callback
/*
queryES.updateIsAnswered('qJfznhheQuOicWWAjx7F05', 0, function(result) {
	console.log("Comment isAnswered updated");
	console.log(result);
});
*/
}