/*
	Question Details
	----------------------------
	Manages the content of a page displaying
	a single question and all of its comments
*/

function refreshQuestionsList() {

}

function refreshQuestionListHeader() {

}

function refreshQuestionDetailsListHeader(question) {
	if (question) {
		var courseTitle = document.getElementById("courseTitle");
		if (!question._source.course) {
			courseTitle.innerHTML = "Questions for <span class='inserted'>All Courses</span> from";
		} else {
			var courseUuid = getUuid(question._source.course.toLowerCase());
			if (!courseUuid || courseUuid === "") {
				courseTitle.innerHTML = "Questions for <span class='inserted'>All Courses</span> from";
			} else {
				common.getCourseById(courseUuid, function(data) {
					courseTitle.innerHTML = "Questions for <span class='inserted'>" 
						+ question._source.course + " " + data.course.title 
						+ "</span> from";
				});
				
				currentCourse = question._source.course;
				selectButtonByName(question._source.course);
			}
		}

		var currentWeek = question._source.week;
		var sectionTitle = document.getElementById("sectionTitle");
		if (currentWeek === 0 || currentWeek === null) {
			sectionTitle.innerHTML = "All Weeks";
		} else if (!courseUuid || courseUuid === "") {
			sectionTitle.innerHTML = "Week " + currentWeek;
		} else {
			rqra.getWeeksByCourseId(courseUuid, function(data) {
				if (data && data.errorcode === 0 && data.week.length > 0) {
					for(var i = 0; i < data.week.length; ++i) {
						if (data.week[i].week === currentWeek) {
							sectionTitle.innerHTML = "Week " + currentWeek + " - " + data.week[i].topic;
						}
					}	
				} else {
					sectionTitle.innerHTML = "Week " + currentWeek;
				}
			});
		}
	}
}

function loadPage(first) {
	var questionId = window.location.pathname.replace("/question/", "");
	var question = document.getElementById("detailedQuestion");
	var commentList = document.getElementById("comments");
	
	// get question
	rqra.getQuestionById(questionId, function(data) {
		if (data && data.errorcode === 0) {
			question.innerHTML = ElementFactory.createDetailedQuestionItem(data.question);
			refreshQuestionDetailsListHeader(data.question);

			// get comments
			rqra.getCommentsByTargetId(questionId, '-', function(data) {
				commentList.innerHTML = "";
				if (data && data.errorcode === 0 && data.comments.hits.length > 0) {
					data.comments.hits.sort(function(a, b){ 
						return (b._source.upvote - b._source.downvote)-(a._source.upvote - a._source.downvote);
					});
				
					//displayPageNumbers(data.questions.total);
					
					for(var i = 0; i < data.comments.hits.length; i++) {
						commentList.innerHTML += ElementFactory.createCommentItem(data.comments.hits[i]);
					}
					
					// updates page view count
					if (first) {
						rqra.updateQuestionViews(questionId, function(data) {
						
						});
					}
				} else {
					commentList.innerHTML += ElementFactory.createQuestionsNotFoundItem();
				}
			});
		}
	});
}

function postComment() {
	var questionId = window.location.pathname.replace("/question/", "");
	var commentBody = document.getElementById("replyText").value;
	var commentList = document.getElementById("comments");
	
	rqra.createComment(questionId, commentBody, function(data) {
		if (data && data.errorcode === 0) {
			rqra.getCommentById(data.comment._id, function(data2) {
				commentList.innerHTML += ElementFactory.createCommentItem(data2.comment);
			});
		}
	});
}

function vote(dir, targetDiv) {
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
	redirect = true;
	displayCourseList();
	loadPage(true);
}