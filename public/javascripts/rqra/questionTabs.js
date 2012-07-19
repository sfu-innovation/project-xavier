var rqra = new coreApi.Presenter();
var display = displayNew;

function formatQuestion(question) {
	return "<div class='question'>"
			+ "<div id='questionText'>" + question._source.body + "</div>"
			+ "<div class='questionData'>"
				+ "<div class='profResponsesRecent'>5 <img src='../images/rqra/prof.png' alt='Instructor Responses'/></div>"
				+ "<div class='replies'>" + question._source.commentCount + " <img src='../images/rqra/reply.png' alt='Replies'/></div>"
				+ "<div class='views'>" + question._source.viewCount + " <img src='../images/rqra/view.png' alt='Views'/></div>"
				+ "<div>Asked "
					+ "<span class='inserted'>" + jQuery.timeago(new Date(question._source.timestamp)) + "</span> "
					+ "by <span class='inserted'>" + question._source.user + "</span></div>"
			+ "</div>";
}

function callDisplay(page, displayCallback) {
	var questionList = document.getElementById("questionsList");
	displayCallback(page, function (data) {
		console.log(data);
		if (data && data.errorcode === 0 && data.questions.hits.length > 0) {
			displayTotal(data.questions.total);
			displayPageNumbers(data.questions.total);
			questionList.innerHTML = "";
			$.each(data.questions.hits, function (index, item) {
				questionList.innerHTML += formatQuestion(item);
			});
		}
	});
}

function displayNew(page) {
	callDisplay(page, rqra.getNewQuestions);
}

function displayUnanswered(page) {
	callDisplay(page, rqra.getUnansweredQuestions);
}

function displayTotal(total) {
	var questionCount = document.getElementById("questionCountNumber");
	questionCount.innerHTML = total;
}

function displayPageNumbers(total) {
	var pageNumbers = document.getElementById("pageNumber");
	pageNumbers.innerHTML = "<img src='../images/rqra/prev.png' alt='previous'>";
	for(var i = 0; i < total/5; i++) {
		pageNumbers.innerHTML += "<div class='pageNumberButton' onclick='displayNew(" + i + ")'>" + (i+1) + "</div>";
	}
	pageNumbers.innerHTML += "<img src='../images/rqra/next.png' alt='next'>";
}

// displays asked questions on page load
displayNew(0);