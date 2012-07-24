var common = new coreApi.Common();

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
			selectorBottom.style.top = "2.5em";
			selectorBottom.style.opacity = "0";
		} else {
			selectorBottom.style.top = "2.1em";
			selectorBottom.style.opacity = "100";
		}
	}
}

function selectButton(selectedButton) {
	var menu = document.getElementById("courseList");
	var buttons = menu.querySelectorAll(".courseButton");
	NodeList.prototype.forEach = Array.prototype.forEach;
	buttons.forEach(function(obj) {
		if (selectedButton === obj) {
			currentCourse = selectedButton.querySelector(".courseButtonText").innerHTML;
			currentCourse = currentCourse.toLowerCase();
			refreshQuestionListHeader();
			refreshQuestionsList();
			setSelected(obj, true);
		} else {
			setSelected(obj, false);
		}
	});
}

function formatButton(name, uuid) {
	return "<div class='courseButton' onclick='selectButton(this)'>"
		+ "<div class='courseButtonSelectorTop'></div>"
		+ "<div class='courseButtonId' style='display:none;'>" + uuid + "</div>"
		+ "<div class='courseButtonText'>" + name + "</div>"
		+ "<div class='courseButtonSelectorBottom'></div>"
		+ "</div>";
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
			menu.innerHTML += formatButton("All", "");
			data.courses.forEach(function(course) {
				menu.innerHTML += formatButton(course.subject + "" + course.number, course.uuid);
			});
		}
	});
}

displayCourseList();
