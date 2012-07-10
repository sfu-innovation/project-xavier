//TODO: map result to Question model

var queryES = require('../../../controller/queryES.js');
var question = require('../../../models/question.js');
var comment = require('../../../models/comment.js');
var qID = '';
var target_uuid = '';
var cID = '';

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
}


//////////////////////////////////////////////////////////////////////////////////////////////////
// Comments 
//////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
	comments:{
		setUp: function(callback){
			target_uuid = qID;
			callback();
		},
		tearDown: function(callback){
			callback();
		},
//*****************GET a comment***********************
//@params: commentID, type, callback
		"getComment": function(test){		
			queryES.getComment('aJfzggggguOicWWAjx7F05', 1, function(result){				
				test.ok(result);
				test.done();
			});
		},
//*****************GET all comments*********************
//@params: type, callback
		"getAllComment":function(test){			
			 queryES.getAllComment(0, function(result){
		 		test.ok(result);
				test.done();
			 })	
		},
//*****************GET all comments by user uuid********
//@params: userID, type, callback
		"getAllCommentByUserID":function(test){			
			queryES.getAllCommentByUserID('mcs3', 1, function(result){
				test.ok(result);
				test.done();
			})			
		},
//*****************ADD a comment***********************
//Comment model takes in target_uuid, user, objectType, title, body
//@params: comment model, type, callback
		"addComment": function(test){			
			var comment = new comment(target_uuid, 'snsd6', 'presenter', 'About dancing', 'Dancing time...', '2012-05-07');
			queryES.addComment(comment, 0, function(result){
				cID = result._id;
				test.ok(result);
				test.done();
			});
		},
//****************GET a comment by target_uuid**************
//@params: target_uuid, appType, callback
		"getCommentByTarget_uuid":function(test){
			queryES.getCommentByTarget_uuid(target_uuid, 0, function(result){
				test.ok(result);
				test.done();
			});
		},
//*****************UPDATE a comment**********************
//@params: commentID, commentTitle, commentBody, appType, callback
		"updateComment":function(test){
			queryES.updateComment(cID, 'updated comment', 'updated body', 0, function(result){
				test.ok(result);
				test.done();
			});
		},
//*****************UPDATE a comment's vote**********************
//direction: 0 = up, 1 = down
//@params: commentID, direction, type, callback
		"updateCommentVote":function(test){
			queryES.updateVote(cID, 1, 0, function(result) {
				test.ok(result);
				test.done();
			});
		},
//*****************UPDATE a comment's isAnswered**********************
//@params: commentID, appType, callback
		"updateCommentIsAnswered":function(test){
			queryES.updateIsAnswered(cID, 0, function(result) {
				test.ok(result);
				test.done();
			});
		},
//*****************DELETE a comment***********************
//@params: commentID, type, callback
		"deleteComment":function(test){
			queryES.deleteComment(cID, 0, function(result){
				test.ok(result);
				test.done();
			})
		}
	}
}



