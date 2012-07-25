var rqra = new coreApi.Presenter();

function formatQuestion(question) {
	return "<div class='detailedQuestion'>"
			+ "<div class='questionTitle'>" + question._source.title + "</div>"
			+ "<div class='questionId'>" + question._id + "</div>"
			+ "<div class='questionDetailsText'>" + question._source.body + "</div>"
			+ "<div class='questionData'>"
				+ "<div class='profResponsesRecent'>5 <img src='../images/rqra/prof.png' alt='Instructor Responses'/></div>"
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

	return "<div class='detailedQuestion' style='" + instructorStyle + "'>"
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

function loadPage(first) {
	var questionId = window.location.pathname.replace("/question/", "");
	var question = document.getElementById("detailedQuestion");
	var commentList = document.getElementById("comments");
	
	// updates page view count
	if (first) {
		rqra.updateQuestionViews(questionId, function(data) {});
	}
	
	// get question
	rqra.getQuestionById(questionId, function(data) {
		if (data && data.errorcode === 0) {
			question.innerHTML = formatQuestion(data.question);
			//displayPageNumbers(data.questions.total);
		}
	});
	
	// get comments
	rqra.getCommentsByTargetId(questionId, 0, function(data) {
		commentList.innerHTML = "";
		if (data && data.errorcode === 0 && data.comments.hits.length > 0) {
			//displayPageNumbers(data.questions.total);
			
			$.each(data.comments.hits, function (index, item) {
				commentList.innerHTML += formatComment(item);
			});
		}
	});
}

function postComment() {
	var questionId = window.location.pathname.replace("/question/", "");
	var commentBody = document.getElementById("replyText").value;
	rqra.createComment(questionId, commentBody, function(data) {
		console.log(data);
		if (data && data.errorcode === 0) {
			loadPage(false);
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