/*
	Course List
	----------------------------
	Responsible for controlling the course list widget
	which appear across all pages
*/

var redirect = false;

function setSelected(button, select) {
	var buttonText = button.querySelector(".courseButtonText");
	var selectorTop = button.querySelector(".courseButtonSelectorTop");
	if (selectorTop) {
		if (!select) {
			selectorTop.style.height = "0%";
			buttonText.style.fontWeight = "normal";
		} else {
			selectorTop.style.height = "100%";
			buttonText.style.fontWeight = "bold";
		}
	}
	
	var selectorBottom = button.querySelector(".courseButtonSelectorBottom");
	if (selectorBottom) {
		if (!select) {
			selectorBottom.style.top = "40px";
			selectorBottom.style.opacity = "0";
		} else {
			selectorBottom.style.top = "30px";
			selectorBottom.style.opacity = "100";
		}
	}
}

function clickButton(selectedButton) {
	QuestionCommon.setCourse(selectedButton.querySelector(".courseButtonText").innerHTML.toLowerCase());
	QuestionCommon.refreshDefaultHeader();
	if (redirect) {
		window.location = "/questions";
	}
	selectButton(selectedButton);
}

function selectButton(selectedButton) {
	var menu = document.getElementById("courseList");
	var buttons = menu.querySelectorAll(".courseButton");
	for (var i = 0; i < buttons.length; ++i) {
		if (selectedButton === buttons[i]) {
			refreshQuestionsList();
			setSelected(buttons[i], true);
		} else {
			setSelected(buttons[i], false);
		}
	}
}

function selectButtonByName(name) {
	var menu = document.getElementById("courseList");
	var buttons = menu.querySelectorAll(".courseButton");
	for (var i = 0; i < buttons.length; ++i) {
		if (name === buttons[i].querySelector(".courseButtonText").innerHTML) {
			setSelected(buttons[i], true);
		}	else {
			setSelected(buttons[i], false);
		}
	}
}

function getUuid(courseName) {
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

function displayCourseList() {
	common.getUserCourses(function(data) {
		if (data && data.errorcode === 0) {
			var menu = document.getElementById("courseList");
			menu.innerHTML = "";
			menu.innerHTML += ElementFactory.createCourseListItem("All", "");
			for (var i = 0; i < data.courses.length; i++) {
				menu.innerHTML += ElementFactory.createCourseListItem(data.courses[i].subject + "" + data.courses[i].number, data.courses[i].uuid);
			}
			selectButton($(".courseButton")[0]);
		}
	});
}
