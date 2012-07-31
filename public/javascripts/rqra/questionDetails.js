/*
	Question Details
	----------------------------
	Manages the content of a page displaying
	a single question and all of its comments
*/

var voted = []

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

QuestionDetails.refreshDetailsView = function(callback) {
	var question = document.getElementById("detailedQuestion");
	var commentList = document.getElementById("comments");

	// get question
	rqra.getQuestionById(QuestionDetails.getQuestionId(), function(data) {
		if (data && data.errorcode === 0) {
			
			if (data.question._source.course) {
				QuestionCommon.setCourse(data.question._source.course.toLowerCase());
				QuestionCommon.setWeek(data.question._source.week);
			}
			
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
				if (callback) callback();
			});
		}
	});
}

QuestionDetails.postComment = function() {
	var commentBody = document.getElementById("replyText").value;
	var commentList = document.getElementById("comments");
	
	if (commentBody.replace(/^\s+|\s+$/g, "") !== "") {
		if (QuestionDetails.commentCount <= 0) {
			commentList.innerHTML = "";
		}
		QuestionDetails.commentCount++;
		
		rqra.createComment(QuestionDetails.getQuestionId(), commentBody, function(data) {
			console.log(data);
			if (data && data.errorcode === 0) {
				rqra.getCommentById(data.comment._id, function(data2) {
					commentList.innerHTML += ElementFactory.createCommentItem(data2.comment);
				});
				var askForm = document.getElementById("askForm");
				console.log(askForm);
				if (askForm) {
					askForm.innerHTML = ElementFactory.createResponseThankYouItem();
				}
			}
		});
	} else {
		alert("The response is blank, blank responses are not accepted");
	}
}

QuestionDetails.vote = function(dir, targetDiv) {
	var id = targetDiv.parentNode.parentNode.querySelector(".questionId").innerHTML;
	if (voted.indexOf(id) === -1) {
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
		voted += id;
	}
}

QuestionDetails.initialize = function() {
	QuestionDetails.refreshDetailsView(function() {
		CourseList.refreshCourseList(function() {
			CourseList.setSelectedName(QuestionCommon.course);
			QuestionCommon.refreshDefaultHeader();
		});
	});
}

window.onload = function() {
	QuestionDetails.initialize();
}