/*
	Question Common
	----------------------------
	Handles loading the common body elements,
	specifically the course/week header element
*/

function QuestionCommon() { }

// static variables (please use as readonly)
// ------------------------------------------------
QuestionCommon.course = "all";
QuestionCommon.week = 0;

// getters and setters
// ------------------------------------------------

QuestionCommon.setCourse = function(c) {
	QuestionCommon.course = c;
	rqra.setSelectedCourse(QuestionCommon.course, QuestionCommon.week, function(data) { });
}

QuestionCommon.setWeek = function(w) {
	QuestionCommon.week = w;
	rqra.setSelectedCourse(QuestionCommon.course, QuestionCommon.week, function(data) { });
}

// methods
// ------------------------------------------------

// returns the full title of the currently selected course
// ------------------------------------------------
// args:
// 		callback: function(courseTitle) { }
//
QuestionCommon.getCourseTitle = function(callback) {
	if (QuestionCommon.course && QuestionCommon.course !== "" && QuestionCommon.course !== "all") {
		var uuid = getUuid(QuestionCommon.course);
		if (uuid && uuid !== "") {
			common.getCourseById(getUuid(QuestionCommon.course), function(data) {
				callback(QuestionCommon.course.toUpperCase() + " " + data.course.title);
			});
		} else {
			callback(QuestionCommon.course.toUpperCase());
		}
	} else {
		callback("All Courses");
	}
}

// gets the title and topic associated with a current week
// ------------------------------------------------
// args:
//		callback: function(sectionTitle, sectionSubTitle) { }
//
QuestionCommon.getWeekTitle = function(callback) {
	if (QuestionCommon.week === 0 || uuid === "") {
		callback("All Weeks", "");
	} else {
		var uuid = getUuid(QuestionCommon.course);
		if (!uuid || uuid === "") {
			callback("Week " + QuestionCommon.week, "");
		} else {
			rqra.getWeeksByCourseId(uuid, function(data) {
				if (data && data.errorcode === 0 && data.week.length > 0) {
					for(var i = 0; i < data.week.length; ++i) {
						if (data.week[i].week === QuestionCommon.week) {
							callback("Week " + QuestionCommon.week, data.week[i].topic);
							return;
						}
					}
				} 
				callback("Week " + QuestionCommon.week, "");
			});
		}
	}
}

// sets the question header ui component with the given 
// course and section titles
// ------------------------------------------------
// args:
// 		courseTitle: the full title of a course (ie. CMPT471 Networking II)
//      sectionTitle: the week number (ie. Week 1)
//		sectionSubtitle: the topic associated with the week
//
QuestionCommon.setQuestionHeader =  function(courseTitle, sectionTitle, sectionSubTitle) {
	var courseTitleDiv = document.getElementById("courseTitle");
	courseTitleDiv.innerHTML = "Questions for <span class='inserted'>" + courseTitle + "</span> from";
	
	var sectionTitleDiv = document.getElementById("sectionTitle");
	sectionTitleDiv.innerHTML = sectionTitle;
	if (sectionSubTitle && sectionSubTitle !== "") {
		sectionTitleDiv.innerHTML += " <span id='sectionName'>&#8212; " + sectionSubTitle + "</span>";
	}
}

// refreshes the question header with the current course and 
// and week information
QuestionCommon.refreshDefaultHeader = function() {
	QuestionCommon.getCourseTitle(function(courseTitle) {
		QuestionCommon.getWeekTitle(function(sectionTitle, sectionSubTitle) {
			QuestionCommon.setQuestionHeader(courseTitle, sectionTitle, sectionSubTitle);
		});
	});
}