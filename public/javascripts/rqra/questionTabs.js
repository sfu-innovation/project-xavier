var rqra = new coreApi.Presenter();
var display = displayNew;

function formatQuestion(question) {
	return "<div class='question'>"
			+ "<div id='questionText'>" + question._source.body + "</div>"
			+ "<div class='questionData'>"
				+ "<div class='profResponsesRecent'>5 <img src='images/rqra/prof.png' alt='Instructor Responses'/></div>"
				+ "<div class='replies'>5 <img src='images/rqra/reply.png' alt='Replies'/></div>"
				+ "<div class='views'>5 <img src='images/rqra/view.png' alt='Views'/></div>"
				+ "<div>Asked "
					+ "<span class='inserted'>" + new Date(question._source.timestamp).toLocaleString() + "</span> "
					+ "by <span class='inserted'>" + question._source.user + "</span></div>"
			+ "</div>";
}

function callDisplay(page, displayCallback) {
	var questionList = document.getElementById("questionList");
	displayCallback(page, function (data) {
		if (data && data.errorcode === 0 && data.questions.length > 0) {
			questionList.innerHTML = "";
			$.each(data.questions, function (index, item) {
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

// displays asked questions on page load
displayNew(0);