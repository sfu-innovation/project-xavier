var common = new coreApi.Common();

function setSelected(button, select) {
	var selectorTop = button.querySelector(".courseButtonSelectorTop");
	if (selectorTop) {
		if (!select) {
			selectorTop.style.height = "0%";
		} else {
			selectorTop.style.height = "100%";
		}
	}
	
	var selectorBottom = button.querySelector(".courseButtonSelectorBottom");
	if (selectorBottom) {
		if (!select) {
			selectorBottom.style.top = "35px";
			selectorBottom.style.opacity = "0";
		} else {
			selectorBottom.style.top = "30px";
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
			setSelected(obj, true);
		} else {
			setSelected(obj, false);
		}
	});
}

function formatButton(name) {
	return "<div class='courseButton' onclick='selectButton(this)'>"
		+ "<div class='courseButtonSelectorTop'></div>"
		+ "<div class='courseButtonText'>" + name + "</div>"
		+ "<div class='courseButtonSelectorBottom'></div>"
		+ "</div>";
}

function displayCourseList() {
	common.getUserCourses("A7S7F8GA7SD98A7SDF8ASD7G", function(data) {
		if (data && data.errorcode === 0) {
			var menu = document.getElementById("courseList");
			menu.innerHTML = "";
			data.courses.forEach(function(course) {
				menu.innerHTML += formatButton(course.subject + "" + course.number);
			});
		}
	});
}

displayCourseList();
