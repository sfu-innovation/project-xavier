/*
	Course List
	----------------------------
	Responsible for controlling the course list widget
	which appear across all pages
*/

function CourseList() { }

CourseList.count = 1;
CourseList.selectedIndex = 0;

CourseList.setSelectedIndex = function(index) {
	CourseList.selectedIndex = index;
	CourseList.refreshButtonSelection();
}

CourseList.getCourseName = function(index) {
	var menu = document.getElementById("courseList");
	var courseName = menu.querySelectorAll(".courseButtonText")[index].innerHTML;
	return courseName.toLowerCase();
}

CourseList.getUuid = function(courseName) {
	var menu = document.getElementById("courseList");
	if (menu) {
		for (var i = 0; i < menu.children.length; ++i) {
			if (courseName && courseName.toUpperCase() === menu.children[i].querySelector(".courseButtonText").innerHTML) {
				return menu.children[i].querySelector(".courseButtonId").innerHTML;
			}
		}
	}
	return "";
}

CourseList.refreshCourseList = function(callback) {
	common.getUserCourses(function(data) {
		if (data && data.errorcode === 0) {
			var menu = document.getElementById("courseList");
			if (menu) {
				menu.innerHTML = "";
				menu.innerHTML += ElementFactory.createCourseListItem("All", "", 0);
				CourseList.count = data.courses.length+1;
				for (var i = 0; i < data.courses.length; i++) {
					var course = data.courses[i];
					menu.innerHTML += ElementFactory.createCourseListItem(course.subject + "" + course.number, course.uuid, (i+1));
				}
			}
		}
		if (callback) callback();
	});
}

CourseList.refreshButtonSelection = function() {
	for(var i = 0; i < CourseList.count; ++i) {
		CourseList.setStyleSelected(i, (i === CourseList.selectedIndex));
	}
}

CourseList.setStyleSelected = function(index, selected) {
	var menu = document.getElementById("courseList");
	
	var buttonText = menu.querySelectorAll(".courseButtonText")[index];
	var selectorTop = menu.querySelectorAll(".courseButtonSelectorTop")[index];
	if (selectorTop) {
		if (!selected) {
			selectorTop.style.height = "0%";
			buttonText.style.fontWeight = "normal";
		} else {
			selectorTop.style.height = "100%";
			buttonText.style.fontWeight = "bold";
		}
	}
	
	var selectorBottom = menu.querySelectorAll(".courseButtonSelectorBottom")[index];
	if (selectorBottom) {
		if (!selected) {
			selectorBottom.style.top = "40px";
			selectorBottom.style.opacity = "0";
		} else {
			selectorBottom.style.top = "30px";
			selectorBottom.style.opacity = "100";
		}
	}
}

CourseList.clickButton = function(index) {
	QuestionCommon.setCourse(CourseList.getCourseName(index));
	QuestionCommon.refreshDefaultHeader();
	if (typeof(QuestionList) !== "undefined") QuestionList.refreshQuestionsList();
	CourseList.setSelectedIndex(index);
}
