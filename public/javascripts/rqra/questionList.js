/*
	Question List
	----------------------------
	Manages the page that lists all of the questions
*/

var rqra = new coreApi.Presenter();
var common = new coreApi.Common();
var prevSearchQuery = "";
var prevSearchType = "latest";

function refreshQuestionListHeader() {
	var courseUuid = getUuid(currentCourse);
	var courseTitle = document.getElementById("courseTitle");
	if (!currentCourse || currentCourse === "" || currentCourse === "all") {
			courseTitle.innerHTML = "Questions for <span class='inserted'>All Courses</span> from";
	} else {
		common.getCourseById(courseUuid, function(data) {
			courseTitle.innerHTML = "Questions for <span class='inserted'>" 
				+ currentCourse.toUpperCase() + " " + data.course.title 
				+ "</span> from";
		});
	}

	var sectionTitle = document.getElementById("sectionTitle");
	if (currentWeek === 0) {
		sectionTitle.innerHTML = "All Weeks";
	} else if (!currentCourse || currentCourse === "" || currentCourse === "all") {
		sectionTitle.innerHTML = "Week " + currentWeek;
	} else {
		rqra.getWeeksByCourseId(courseUuid, function(data) {
			if (data && data.errorcode === 0 && data.week.length > 0) {
				for(var i = 0; i < data.week.length; ++i) {
					if (data.week[i].week === currentWeek) {
						sectionTitle.innerHTML = "Week " + currentWeek + " <span id='sectionName'>&#8212; " + data.week[i].topic + "</span>";
					}
				}	
			} else {
				sectionTitle.innerHTML = "Week " + currentWeek;
			}
		});
	}
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
	displayQuestions("latest", 0);
	refreshQuestionListHeader();
}