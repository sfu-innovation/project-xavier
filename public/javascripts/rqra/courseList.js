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