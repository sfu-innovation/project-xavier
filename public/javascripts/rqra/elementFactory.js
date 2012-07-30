/*
	Element Factory
	----------------------------
	A static object that contains helper methods for generating
	common html, mostly in the case of list items
*/

function ElementFactory() { }

ElementFactory.createCourseListItem = function(name, uuid) {
	var courseListItem = ""
		+ "<div class='courseButton' onclick='clickButton(this)'>"
			+ "<div class='courseButtonSelectorTop'></div>"
			+ "<div class='courseButtonId' style='display:none;'>" + uuid + "</div>"
			+ "<div class='courseButtonTextContainer'>" 
				+ "<div class='courseButtonText'>" + name + "</div>"
			+ "</div>"
			+ "<div class='courseButtonSelectorBottom'></div>"
		+ "</div>";
	return courseListItem;
}

ElementFactory.createQuestionItem = function(question) {
	if (question && question._source) {
		// check for valid user information on question object
		var user = { firstName: "Jane", lastName: "Doe" };
		if (question.user && question.user.firstName && question.user.lastName) {
			user = question.user;
		}
		
		// check if instructor response flag has been set
		var instructorStyle = "";
		if (question._source.isInstructor === "true") {
			instructorStyle = "instructorResponseFlag";
		}

		var questionItem = ""
		+ "<div class='question' onclick='gotoQuestionPage(this)'>"
			+ "<div class='questionId'>" + question._id + "</div>"
			+ "<div class='questionText'>" + question._source.title + "</div>"
			+ "<div class='questionData'>"
				+ "<div class='" + instructorStyle + "'>"
					+ "<img src='../images/rqra/prof.png' alt='Instructor Responses'/>"
				+ "</div>"
				+ "<div class='replies'>" + question._source.commentCount + " <img src='../images/rqra/reply.png' alt='Replies'/></div>"
				+ "<div class='views'>" + question._source.viewCount + " <img src='../images/rqra/view.png' alt='Views'/></div>"
				+ "<div>Asked "
					+ "<span class='inserted'>" + jQuery.timeago(new Date(question._source.timestamp)) + "</span> "
					+ "by <span class='inserted'>" + user.firstName + " " + user.lastName + "</span>"
				+ "</div>"
			+ "</div>";
		return questionItem;
	} else {
		console.error("ElementFactory: cannot create question item, question is undefined!");
		return "";
	}
}
	
ElementFactory.createDetailedQuestionItem = function(question) {
	if (question && question._source) {
		// check for valid user information on question object
		var user = { firstName: "Jane", lastName: "Doe" };
		if (question.user && question.user.firstName && question.user.lastName) {
			user = question.user;
		}
		
		// check if instructor response flag has been set
		var instructorStyle = "";
		if (question._source.isInstructor === "true") {
			instructorStyle = "instructorResponseFlag";
		}

		var questionItem = ""
		+ "<div class='question' style='cursor: default;'>"
			+ "<div class='questionId'>" + question._id + "</div>"
			+ "<div class='questionTitle'>" + question._source.title + "</div>"
			+ "<div class='questionData'>"
				+ "<div class='" + instructorStyle + "'>"
					+ "<img src='../images/rqra/prof.png' alt='Instructor Responses'/>"
				+ "</div>"
				+ "<div class='replies'>" + question._source.commentCount + " <img src='../images/rqra/reply.png' alt='Replies'/></div>"
				+ "<div class='views'>" + question._source.viewCount + " <img src='../images/rqra/view.png' alt='Views'/></div>"
				+ "<div>Asked "
					+ "<span class='inserted'>" + jQuery.timeago(new Date(question._source.timestamp)) + "</span> "
					+ "by <span class='inserted'>" + user.firstName + " " + user.lastName + "</span>"
				+ "</div>"
			+ "</div>"
			+ "<div class='questionDetailsText'>" + question._source.body + "</div>"
		+ "</div>";
		return questionItem;
	} else {
		console.error("ElementFactory: cannot create detailed question item, question is undefined!");
		return "";
	}
}

ElementFactory.createQuestionsNotFoundItem = function() {
	var item = ""
		+ "<div class='question' style='cursor: default;'>"
			+ "<div class='questionText'>No Questions Found!</div>"
		+ "</div>";
	return item;
}

ElementFactory.createPageNumbers = function(number) {
	if (number > 0) {
		var item = "<img src='../images/rqra/prev.png' alt='previous'>";
		for(var i = 0; i < number/7; i++) {
			item += "<div class='pageNumberButton' onclick='changePage(" + i + ")'>" + (i+1) + "</div>";
		}
		item += "<img src='../images/rqra/next.png' alt='next'>";
		return item;
	} else {
		return "";
	}
}
		
ElementFactory.createCommentItem = function(comment) {
	if (comment && comment._source) {
		// check that user object is valid and if the user is an instructor
		var user = { firstName: "Jane", lastName: "Doe" };
		var instructorStyle = "";
		if (comment.user && comment.user.firstName && comment.user.lastName) {
			user = comment.user;
			if (comment.user.type === 1) {
				instructorStyle = "background: #ffe450;";
			}
		}
		
		// check if the comment has more down votes than up votes
		var badCommentStyle = "";
		if (comment._source.upvote - comment._source.downvote < 0) {
			badCommentStyle = "color: #AAAAAA;";
		}
		
		var commentItem = ""
			+ "<div class='comment' style='" + instructorStyle + badCommentStyle + "'>"
				+ "<div class='questionId'>" + comment._id + "</div>"
				+ "<div class='questionDetailsText'>" + comment._source.body + "</div>"
				+ "<div class='questionData'>"
				+ "<div>Asked "
					+ "<span class='inserted'>" + jQuery.timeago(new Date(comment._source.timestamp)) + "</span> "
					+ "by <span class='inserted'>" + user.firstName + " " + user.lastName + "</span>"
				+ "</div>"
				+ "<div class='votes' onclick='vote(1, this)'>"
					+ "<span class='upVoteCount'>" + comment._source.upvote + "</span> " 
					+ "<img src='../images/rqra/up.png' alt='UpVotes'/>"
				+ "</div>"
				+ "<div class='votes' onclick='vote(-1, this)'>"
					+ "<span class='downVoteCount'>" + comment._source.downvote + "</span> " 
					+ "<img src='../images/rqra/up.png' alt='DownVotes'/>"
				+ "</div>"
			+ "</div>";
		return commentItem;
	} else {
		console.error("ElementFactory: cannot create comment item, comment is undefined!");
		return "";
	}
}

ElementFactory.createNotificationItem = function(notification) {
	if (notification && notification.notification && notification.notificationListener) {
		var notificationType = "notificationRegular";
		
		// check that user object is valid and if the user is an instructor
		var user = { firstName: "Jane", lastName: "Doe" };
		if (notification.user && notification.user.firstName && notification.user.lastName) {
			user = notification.user;
			if (user.type === 1) {
				notificationType = "notificationInstructor";
			}
		}
		
		var notificationItem = ""
			+ "<div class='" + notificationType + "'>"
				+ "<div class='notificationMessage' onclick='navToQuestion(this)'>" 
					+ "<span class='notificationSender'>" + user.firstName + " " + user.lastName + "</span>"
					+ "<span>  replied to your question</span>"
					+ "<div class='notificationTime'>" + jQuery.timeago(new Date(notification.notification.createdAt)) + "</div>"
					+ "<div class='notificationTarget' style='display:none;'>" + notification.notificationListener.target + "</div>"
				+ "</div>"
			+ "</div>";
		return notificationItem;
	} else {
		console.error("ElementFactory: cannot create notification item, notification is undefined!");
		return "";
	}
}

ElementFactory.createQuestionCounter = function(count, line1, line2) {
	var item = ""
		+ "<div id='questionCountNumber'>" + count + "</div>"
		+ "<div id='questionCountText'>"
			+ "<div id='questionCountText1'>" + line1 + "</div>"
			+ "<div id='questionCountText2'>" + line2 + "</div>"
		+ "</div>";
	return item;
}