var rqra = new coreApi.Presenter();
var common = new coreApi.Common();
var prevSearchQuery = "";
var prevSearchType = "latest";

function formatQuestion(question) {
	var instructorStyle = "";
	if (question._source.isInstructor === "true") {
		instructorStyle = "instructorResponseFlag";
	}
	
	return "<div class='question' onclick='gotoQuestionPage(this)'>"
			+ "<div class='questionId'>" + question._id + "</div>"
			+ "<div class='questionText'>" + question._source.title + "</div>"
			+ "<div class='questionData'>"
				+ "<div class='" + instructorStyle + "'>"
				+ "<img src='../images/rqra/prof.png' alt='Instructor Responses'/></div>"
				+ "<div class='replies'>" + question._source.commentCount + " <img src='../images/rqra/reply.png' alt='Replies'/></div>"
				+ "<div class='views'>" + question._source.viewCount + " <img src='../images/rqra/view.png' alt='Views'/></div>"
				+ "<div>Asked "
					+ "<span class='inserted'>" + jQuery.timeago(new Date(question._source.timestamp)) + "</span> "
					+ "by <span class='inserted'>" + question.user.firstName + " " + question.user.lastName + "</span></div>"
			+ "</div>";
}

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
						sectionTitle.innerHTML = "Week " + currentWeek + " &#8212; " + data.week[i].topic;
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
				questionList.innerHTML += formatQuestion(data.questions.hits[i]);
			}
		} else {
			displayTotal(0);
			displayPageNumbers(0);
			questionList.innerHTML += "<div class='question'><div class='questionText'>No Questions Found!</div></div>";
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
	pageNumbers.innerHTML = "<img src='../images/rqra/prev.png' alt='previous'>";
	for(var i = 0; i < total/7; i++) {
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
refreshQuestionListHeader();