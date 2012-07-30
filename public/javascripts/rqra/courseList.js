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
	if (redirect) {
		currentCourse = selectedButton.querySelector(".courseButtonText").innerHTML.toLowerCase();
		rqra.setSelectedCourse(currentCourse, 0, function(data) { });
		window.location = "/questions";
	}
	selectButton(selectedButton);
}

function selectButton(selectedButton) {
	var menu = document.getElementById("courseList");
	var buttons = menu.querySelectorAll(".courseButton");
	NodeList.prototype.forEach = Array.prototype.forEach;
	buttons.forEach(function(obj) {
		if (selectedButton === obj) {
			currentCourse = selectedButton.querySelector(".courseButtonText").innerHTML;
			currentCourse = currentCourse.toLowerCase();
			if (currentCourse === "all") currentCourse = "";
			
			refreshQuestionListHeader();
			refreshQuestionsList();
			
			setSelected(obj, true);
		} else {
			setSelected(obj, false);
		}
	});
}

function selectButtonByName(name) {
	var menu = document.getElementById("courseList");
	var buttons = menu.querySelectorAll(".courseButton");
	NodeList.prototype.forEach = Array.prototype.forEach;
	buttons.forEach(function(obj) {
		if (name === obj.querySelector(".courseButtonText").innerHTML) {
			setSelected(obj, true);
		}	else {
			setSelected(obj, false);
		}
	});
}

function getUuid(courseName) {
	var menu = document.getElementById("courseList");
	for (var i = 0; i < menu.children.length; ++i) {
		var child = menu.children[i];
		if (courseName.toUpperCase() === child.querySelector(".courseButtonText").innerHTML) {
			return child.querySelector(".courseButtonId").innerHTML;
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
