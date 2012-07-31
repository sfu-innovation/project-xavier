/*
	Question Form
	----------------------------
	Manages the page where a user asks a question
*/

/*
	Question Details
	----------------------------
	Manages the contents of the ask a question page
	including the various form widgets
*/

function QuestionForm() { }

QuestionForm.getQuestionTitle = function() {
	return document.getElementById("questionField").value;
}

QuestionForm.getQuestionBody = function() {
	return document.getElementById("descriptionField").value;
}

QuestionForm.getWeek = function() {
	var weekBox = document.getElementById("weekBox");
	if (weekBox) {
		return parseInt(weekBox.value);
	} else {
		return 1;
	}
}

QuestionForm.getSessionWeek = function() {
	var hiddenWeek = document.getElementById("hiddenWeek");
	if (hiddenWeek) {
		return hiddenWeek.innerHTML;
	}
	return "";
}

QuestionForm.getCourseName = function() {
	var courseBox = document.getElementById("courseBox");
	if (courseBox) {
		var index = courseBox.selectedIndex;
		return courseBox.children[index].title.toLowerCase();
	} else {
		return "";
	}
}

QuestionForm.getSessionCourse = function() {
	var hiddenCourse = document.getElementById("hiddenCourse");
	if (hiddenCourse) {
		return hiddenCourse.innerHTML;
	}
	return "";
}

QuestionForm.setSelectedWeek = function(w) {
	w--;
	if (w == -1) w = 0;

	QuestionCommon.setWeek(w);
	var weekBox = document.getElementById("weekBox");
	if (weekBox) {
		weekBox.selectedIndex = w;
	}
}

QuestionForm.setSelectedCourse = function(c) {
	if (c && c !== "") {
		var courseBox = document.getElementById("courseBox");
		for (var i = 0; i < courseBox.children.length; ++i) {
			if (courseBox.children[i].getAttribute("title").toLowerCase() === c.toLowerCase()) {
				courseBox.selectedIndex = i;
				break;
			}
		}
		QuestionForm.refreshWeekBox();
	}
}

QuestionForm.getCourseUuid = function() {
	var courseBox = document.getElementById("courseBox");
	if (courseBox) {
		var index = courseBox.selectedIndex;
		return courseBox.children[index].value;
	} else {
		return "";
	}
}

// when the course is changed in the question form drop box
QuestionForm.onCourseBoxChanged = function() {
	QuestionCommon.setCourse(QuestionForm.getCourseName());
	CourseList.setSelectedName(QuestionForm.getCourseName());
	QuestionForm.refreshWeekBox();
}

QuestionForm.refreshCourseBox = function(callback) {
	var courseBox = document.getElementById("courseBox");
	if (courseBox) {
		common.getUserCourses(function(data) {
			if (data && data.errorcode === 0) {
				courseBox.innerHTML = "";
				for(var i = 0; i < data.courses.length; ++i) {
					courseBox.innerHTML += ElementFactory.createCourseBoxItem(data.courses[i]);
				}
				QuestionForm.refreshWeekBox(callback);
			} else {
				console.error("Question Form: get User Courses returned an invalid result");
				if (callback) callback();
			}
		});
	} else {
		console.error("Question Form: courseBox div not found");
		if (callback) callback();
	}
}

QuestionForm.refreshWeekBox = function(callback) {
	var courseId = QuestionForm.getCourseUuid();
	var weekBox = document.getElementById("weekBox");
	if (weekBox && courseId !== "") {
		rqra.getWeeksByCourseId(courseId, function(data) {
			weekBox.innerHTML = "";
			if (data && data.errorcode === 0 && data.week.length > 0) {
				data.week.sort(function(a,b) { return a.week - b.week } );
				for(var i = 0; i < data.week.length; ++i) {
					weekBox.innerHTML += ElementFactory.createWeekBoxItem(i, data.week[i]);
				}
			} else {
				for(var i = 1; i <= 12; ++i) {
					weekBox.innerHTML += ElementFactory.createWeekBoxItem(i);
				}
			}
			if (callback) callback();
		});
	} else {
		console.error("Question Form: weekBox div not found or courseId is null");
		if (callback) callback();
	}
}

QuestionForm.refreshCustomQuestionHeader = function() {
	QuestionCommon.getCourseTitle(function(courseTitle) {
		QuestionCommon.setQuestionHeader(courseTitle, "Ask a Question", "");
	});
}

QuestionForm.postQuestion = function() {
	var title = QuestionForm.getQuestionTitle();
	if (title && title.replace(/^\s+|\s+$/g, "") !== "") {
		rqra.createQuestion(QuestionForm.getQuestionTitle(), QuestionForm.getQuestionBody(), QuestionForm.getCourseName(), QuestionForm.getWeek(), function(data) {
			if (data && data.errorcode === 0 && data.question) {
				document.location.href = "/question/" + data.question._id;
			} else {
				console.error("Question Form: failed to create question");
			}
		});
	} else {
		alert("The question is a required field but has been left blank. Please enter a question.")
	}
}

QuestionForm.initialize = function() {
	CourseList.refreshCourseList(function() {
		CourseList.setSelectedName(QuestionForm.getSessionCourse());
		QuestionForm.refreshCourseBox(function() {
			QuestionCommon.setCourse(QuestionForm.getSessionCourse());
			QuestionForm.setSelectedCourse(QuestionForm.getSessionCourse());
			QuestionForm.setSelectedWeek(QuestionForm.getSessionWeek());
			QuestionForm.refreshCustomQuestionHeader();
		});
	});
}

window.onload = function() {
	QuestionForm.initialize();
}