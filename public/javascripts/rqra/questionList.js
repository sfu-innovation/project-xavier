/*
	Question List
	----------------------------
	Manages the page that lists all of the questions
*/

var prevSearchQuery = "";
var prevSearchType = "latest";

function refreshQuestionsList() {
	displayQuestions(prevSearchType, 0);
}

function displayQuestions(searchType, page) {
	var searchQuery = prevSearchQuery;
	prevSearchType = searchType;
	
	var questionList = document.getElementById("questionsList");
	
	var currentCourse = QuestionCommon.course;
	if (currentCourse.toLowerCase() === "all") currentCourse = "";
	
	rqra.searchSortedQuestions(searchQuery, searchType, currentCourse, QuestionCommon.week, page, function (data) {
		questionList.innerHTML = "";
		if (data && data.errorcode === 0 && data.questions.hits.length > 0) {
			displayTotal(data.questions.total);
			displayPageNumbers(data.questions.total);
			for (var i = 0; i < data.questions.hits.length; ++i) {
				questionList.innerHTML += ElementFactory.createQuestionItem(data.questions.hits[i]);
			}
		} else {
			displayTotal(0);
			displayPageNumbers(0);
			questionList.innerHTML += ElementFactory.createQuestionsNotFoundItem();
		}
	});
}

function updateSearch() {
	var inputbox = document.getElementById("askQuestionInput");
	if (inputbox.value != prevSearchQuery && inputbox.value != "Ask a Question") {
		console.log(inputbox.value);
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
	pageNumbers.innerHTML = ElementFactory.createPageNumbers(total);
}

function gotoQuestionPage(clicked) {
	var questionId = clicked.firstChild.innerHTML;
	document.location.href = "/question/" + questionId;
}

window.onload = function() {
	// displays asked questions on page load
	displayCourseList();
	displayQuestions("latest", 0);
	QuestionCommon.refreshDefaultHeader();
}