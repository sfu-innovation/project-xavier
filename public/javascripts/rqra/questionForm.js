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

QuestionForm.getCourseName = function() {
	var courseBox = document.getElementById("courseBox");
	if (courseBox) {
		var index = courseBox.selectedIndex;
		var courseName = courseBox.children[index].title.toLowerCase();
	} else {
		return "";
	}
}

QuestionForm.getCourseUuid = function() {
	var courseBox = document.getElementById("courseBox");
	if (courseBox) {
		var index = courseBox.selectedIndex;
		var courseName = courseBox.children[index].value;
	} else {
		return "";
	}
}

QuestionForm.onCourseBoxChanged = function() {
	QuestionCommon.setCourse(QuestionForm.getCourseName());
	QuestionForm.refreshCourseBox();
}

QuestionForm.refreshCourseBox = function() {
	var courseBox = document.getElementById("courseBox");
	if (courseBox) {
		common.getUserCourses(function(data) {
			if (data && data.errorcode === 0) {
				courseBox.innerHTML = "";
				for(var i = 0; i < data.courses.length; ++i) {
					courseBox.innerHTML += ElementFactory.createCourseBoxItem(data.courses[i]);
				}
				QuestionForm.refreshWeekBox();
			} else {
				console.error("Question Form: get User Courses returned an invalid result");
			}
		});
	} else {
		console.error("Question Form: courseBox div not found");
	}
}

QuestionForm.refreshWeekBox = function() {
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
		});
	} else {
		console.error("Question Form: weekBox div not found or courseId is null");
	}
}

QuestionForm.refreshCustomQuestionHeader = function() {
	QuestionCommon.getCourseTitle(function(courseTitle) {
		QuestionCommon.setQuestionHeader(courseTitle, "Ask a Question", "");
	});
}

QuestionForm.postQuestion = function() {
	rqra.createQuestion(QuestionForm.getQuestionTitle(), QuestionForm.getQuestionBody(), QuestionForm.getCourseName(), QuestionForm.getWeek(), function(data) {
		if (data && data.errorcode === 0 && data.question) {
			document.location.href = "/question/" + data.question._id;
		} else {
			console.error("Question Form: failed to create question");
		}
	});
}

window.onload = function() {
	CourseList.refreshCourseList(function() {
		CourseList.setSelectedIndex(1);
	});
	QuestionForm.refreshCourseBox();
	QuestionForm.refreshCustomQuestionHeader();
}