var rqra = new coreApi.Presenter();

function formatQuestion(question) {
	var instructorStyle = "";
	if (question._source.isInstructor === "true") {
		instructorStyle = "background: #ffe450;";
	}

	return "<div class='question'>"
			+ "<div class='questionTitle'>" + question._source.title + "</div>"
			+ "<div class='questionId'>" + question._id + "</div>"
			+ "<div class='questionDetailsText'>" + question._source.body + "</div>"
			+ "<div class='questionData'>"
				+ "<div style='" + instructorStyle + "'>"
				+ "<img src='../images/rqra/prof.png' alt='Instructor Responses'/></div>"
				+ "<div class='replies'>" + question._source.commentCount + " <img src='../images/rqra/reply.png' alt='Replies'/></div>"
				+ "<div class='views'>" + question._source.viewCount + " <img src='../images/rqra/view.png' alt='Views'/></div>"
				+ "<div>Asked "
					+ "<span class='inserted'>" + jQuery.timeago(new Date(question._source.timestamp)) + "</span> "
					+ "by <span class='inserted'>" + question.user.firstName + " " + question.user.lastName + "</span></div>"
			+ "</div>";
}

function formatComment(comment) {
	var instructorStyle = "";
	if (comment.user.type === 1) {
		instructorStyle = "background: #ffe450;";
	}
	
	var badCommentStyle = "";
	if (comment._source.upvote - comment._source.downvote < 0) {
		badCommentStyle = "color: #AAAAAA;";
	}
	
	return "<div class='question' style='" + instructorStyle + badCommentStyle + "'>"
			+ "<div class='questionId'>" + comment._id + "</div>"
			+ "<div class='questionDetailsText'>" + comment._source.body + "</div>"
			+ "<div class='questionData'>"
				+ "<div>Asked "
					+ "<span class='inserted'>" + jQuery.timeago(new Date(comment._source.timestamp)) + "</span> "
					+ "by <span class='inserted'>" + comment.user.firstName + " " + comment.user.lastName + "</span></div>"
				+ "<div class='votes' onclick='vote(1, this)'><span class='upVoteCount'>" 
				+ comment._source.upvote 
				+ "</span> <img src='../images/rqra/up.png' alt='UpVotes'/></div>"
				+ "<div class='votes' onclick='vote(-1, this)'><span class='downVoteCount'>" 
				+ comment._source.downvote 
				+ "</span> <img src='../images/rqra/down.png' alt='DownVotes'/></div>"
			+ "</div>";
}

function refreshQuestionListHeader(question) {
	var courseUuid = getUuid(question._source.course.toLowerCase());
	var courseTitle = document.getElementById("courseTitle");
	if (!courseUuid || courseUuid === "") {
		courseTitle.innerHTML = "Questions for <span class='inserted'>All Courses</span> from";
	} else {
		common.getCourseById(courseUuid, function(data) {
			courseTitle.innerHTML = "Questions for <span class='inserted'>" 
				+ question._source.course + " " + data.course.title 
				+ "</span> from";
		});
	}

	var currentWeek = question._source.week;
	var sectionTitle = document.getElementById("sectionTitle");
	sectionTitle.innerHTML = "Week " + currentWeek;
	/*if (currentWeek === 0) {
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
	}*/
}

function loadPage(first) {
	var questionId = window.location.pathname.replace("/question/", "");
	var question = document.getElementById("detailedQuestion");
	var commentList = document.getElementById("comments");
	
	// get question
	rqra.getQuestionById(questionId, function(data) {
		if (data && data.errorcode === 0) {
			question.innerHTML = formatQuestion(data.question);
			refreshQuestionListHeader(data.question);
			
			// get comments
			rqra.getCommentsByTargetId(questionId, '-', function(data) {
				commentList.innerHTML = "";
				if (data && data.errorcode === 0 && data.comments.hits.length > 0) {
					data.comments.hits.sort(function(a, b){ 
						return (b._source.upvote - b._source.downvote)-(a._source.upvote - a._source.downvote);
					});
				
					//displayPageNumbers(data.questions.total);
					
					for(var i = 0; i < data.comments.hits.length; i++) {
						commentList.innerHTML += formatComment(data.comments.hits[i]);
					}
					
					// updates page view count
					if (first) {
						rqra.updateQuestionViews(questionId, function(data) {
						
						});
					}
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
				commentList.innerHTML += formatComment(data2.comment);
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

loadPage(true);