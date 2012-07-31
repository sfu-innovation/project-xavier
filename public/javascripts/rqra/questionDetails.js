/*
	Question Details
	----------------------------
	Manages the content of a page displaying
	a single question and all of its comments
*/

function QuestionDetails() { }

QuestionDetails.commentCount = 0;

QuestionDetails.setCommentCount = function(c) {
	QuestionDetails.commentCount = c;
}

QuestionDetails.getQuestionId = function() {
	return window.location.pathname.replace("/question/", "");
}

QuestionDetails.updateViewCount = function() {
	rqra.updateQuestionViews(QuestionDetails.getQuestionId(), function(data) { });
}

QuestionDetails.refreshDetailsView = function() {
	var question = document.getElementById("detailedQuestion");
	var commentList = document.getElementById("comments");

	// get question
	rqra.getQuestionById(QuestionDetails.getQuestionId(), function(data) {
		if (data && data.errorcode === 0) {
			question.innerHTML = ElementFactory.createDetailedQuestionItem(data.question);

			// get comments
			rqra.getCommentsByTargetId(QuestionDetails.getQuestionId(), '-', function(data) {
				commentList.innerHTML = "";
				if (data && data.errorcode === 0 && data.comments.hits.length > 0) {
					data.comments.hits.sort(function(a, b){ 
						return (b._source.upvote - b._source.downvote)-(a._source.upvote - a._source.downvote);
					});
					
					QuestionDetails.setCommentCount(data.comments.hits.length);
					for(var i = 0; i < data.comments.hits.length; i++) {
						commentList.innerHTML += ElementFactory.createCommentItem(data.comments.hits[i]);
					}
					
					QuestionDetails.updateViewCount();
				} else {
					commentList.innerHTML += ElementFactory.createQuestionsNotFoundItem();
				}
			});
		}
	});
}

QuestionDetails.postComment = function() {
	var commentBody = document.getElementById("replyText").value;
	var commentList = document.getElementById("comments");
	
	if (QuestionDetails.commentCount <= 0) {
		commentList.innerHTML = "";
	}
	QuestionDetails.commentCount++;
	
	rqra.createComment(QuestionDetails.getQuestionId(), commentBody, function(data) {
		if (data && data.errorcode === 0) {
			rqra.getCommentById(data.comment._id, function(data2) {
				commentList.innerHTML += ElementFactory.createCommentItem(data2.comment);
			});
		}
	});
}

QuestionDetails.vote = function(dir, targetDiv) {
	var id = targetDiv.parentNode.parentNode.querySelector(".questionId").innerHTML;
	if (dir === 1) {
		rqra.upVoteCommentById(id, function(data) { 
			var previousValue = parseInt(targetDiv.querySelector(".upVoteCount").innerHTML);
			targetDiv.querySelector(".upVoteCount").innerHTML = previousValue+1;
		});
	} else if (dir === -1) {
		rqra.downVoteCommentById(id, function(data) { 
			var previousValue = parseInt(targetDiv.querySelector(".downVoteCount").innerHTML);
			targetDiv.querySelector(".downVoteCount").innerHTML = previousValue+1;
		});
	}
}

window.onload = function() {
	QuestionCommon.refreshDefaultHeader();
	CourseList.refreshCourseList(function() {
		CourseList.setSelectedIndex(0);
	});
	QuestionDetails.refreshDetailsView();
}