var rqra = new coreApi.Presenter();
var prevSearchQuery = "";
var prevSearchType = "latest";

function formatQuestion(question) {
	return "<div class='question' onclick='gotoQuestionPage(this)'>"
			+ "<div class='questionId'>" + question._id + "</div>"
			+ "<div class='questionText'>" + question._source.title + "</div>"
			+ "<div class='questionData'>"
				+ "<div class='profResponsesRecent'>5 <img src='../images/rqra/prof.png' alt='Instructor Responses'/></div>"
				+ "<div class='replies'>" + question._source.commentCount + " <img src='../images/rqra/reply.png' alt='Replies'/></div>"
				+ "<div class='views'>" + question._source.viewCount + " <img src='../images/rqra/view.png' alt='Views'/></div>"
				+ "<div>Asked "
					+ "<span class='inserted'>" + jQuery.timeago(new Date(question._source.timestamp)) + "</span> "
					+ "by <span class='inserted'>" + question._source.user + "</span></div>"
			+ "</div>";
}

function refreshQuestionsList() {
	displayQuestions(prevSearchType, 0);
}

function displayQuestions(searchType, page) {
	var searchQuery = prevSearchQuery;
	prevSearchType = searchType;
	var questionList = document.getElementById("questionsList");
	
	rqra.searchSortedQuestions(searchQuery, searchType, currentCourse, currentWeek, page, function (data) {
		questionList.innerHTML = "";
		if (data && data.errorcode === 0 && data.questions.hits.length > 0) {
			displayTotal(data.questions.total);
			displayPageNumbers(data.questions.total);
			$.each(data.questions.hits, function (index, item) {
				questionList.innerHTML += formatQuestion(item);
			});
		} else {
			questionList.innerHTML += "No Questions Found!";
		}
	});
}

function updateSearch() {
	var inputbox = document.getElementById("askQuestionInput");
	if (inputbox.value != prevSearchQuery) {
		prevSearchQuery = inputbox.value;
		changePage(0);
	}
}
setInterval(updateSearch, 500);

function changePage(page) {
	displayQuestions(prevSearchType, page);
}

function displayTotal(total) {
	var questionCount = document.getElementById("questionCountNumber");
	questionCount.innerHTML = total;
}

function displayPageNumbers(total) {
	var pageNumbers = document.getElementById("pageNumber");
	pageNumbers.innerHTML = "<img src='../images/rqra/prev.png' alt='previous'>";
	for(var i = 0; i < total/5; i++) {
		pageNumbers.innerHTML += "<div class='pageNumberButton' onclick='changePage(" + i + ")'>" + (i+1) + "</div>";
	}
	pageNumbers.innerHTML += "<img src='../images/rqra/next.png' alt='next'>";
}

function gotoQuestionPage(clicked) {
	var questionId = clicked.firstChild.innerHTML;
	document.location.href = "/question/" + questionId;
}

// displays asked questions on page load
displayQuestions("latest", 0);