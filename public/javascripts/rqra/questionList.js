/*
	Question List
	----------------------------
	Manages the page that lists all of the questions
*/

function QuestionList() { }

// static variables (please use as readonly)
// ------------------------------------------------
QuestionList.searchQuery = "";
QuestionList.searchType = "latest";
QuestionList.count = 0;
QuestionList.page = 0;
QuestionList.pageLength = 7; // number of items per page

// getters and setters
// ------------------------------------------------

QuestionList.setCount = function(c) {
	QuestionList.count = c;
	QuestionCommon.setQuestionCounter(c, "Questions", "for this Week");
	QuestionList.refreshPageNumbers();
}

QuestionList.setPage = function(p) {
	QuestionList.page = p;
	QuestionList.refreshQuestionsList();
}

QuestionList.refreshPageNumbers = function() {
	var pageNumbers = document.getElementById("pageNumber");
	var pagesTotal = Math.ceil(QuestionList.count / QuestionList.pageLength);
	pageNumbers.innerHTML = ElementFactory.createPageNumbers(pagesTotal);
}

QuestionList.refreshQuestionsList = function() {
	var questionListDiv = document.getElementById("questionsList");
	if (questionListDiv) {
		var currentCourse = QuestionCommon.course;
		if (currentCourse.toLowerCase() === "all") currentCourse = "";

		rqra.searchSortedQuestions(QuestionList.searchQuery, QuestionList.searchType, currentCourse, QuestionCommon.week, QuestionList.page, function (data) {
			questionListDiv.innerHTML = "";
			if (data && data.errorcode === 0 && data.questions.hits.length > 0) {
				QuestionList.setCount(data.questions.total);
				for (var i = 0; i < data.questions.hits.length; ++i) {
					questionListDiv.innerHTML += ElementFactory.createQuestionItem(data.questions.hits[i]);
				}
			} else {
				QuestionList.setCount(0);
				questionListDiv.innerHTML += ElementFactory.createQuestionsNotFoundItem();
			}
		});
	} else {
		console.error("Question List: could not find questionsList div element");
	}
}

function updateSearch() {
	var inputbox = document.getElementById("askQuestionInput");
	if (inputbox.value != QuestionList.searchQuery && inputbox.value != "Ask a Question") {
		QuestionList.searchQuery = inputbox.value;
		QuestionList.setPage(0);
	}
}
setInterval(updateSearch, 500);

function gotoQuestionPage(clicked) {
	var questionId = clicked.firstChild.innerHTML;
	document.location.href = "/question/" + questionId;
}

function questionTabClicked(tabdiv) {
	if (window.event.target && window.event.target !== tabdiv) {
		QuestionList.searchType = window.event.target.getAttribute("value");
		QuestionList.setPage(0);
	}
}

window.onload = function() {
	// displays asked questions on page load
	displayCourseList();
	QuestionCommon.refreshDefaultHeader();
	QuestionList.refreshQuestionsList();
}