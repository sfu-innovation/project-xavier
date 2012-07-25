var common = new coreApi.Common();

function selectButton(selectedButton) {
	setSelected(selectedButton);

	/*
	if (selectedButton) {
		var coursePrefix = selectedButton.querySelector(".Prefix").innerHTML;
		var courseNumber = selectedButton.querySelector(".Number").innerHTML;

		console.log('i am selected = ' + coursePrefix + ' ' + courseNumber);
		var currentCourse = coursePrefix + courseNumber;
		refreshQuestions(currentCourse);
	}
	else {
		console.log('all selected');
		refreshQuestions('');
	}
	*/


	return false;
}

function setSelected(select) {	
	var 
		p = $(select).parent(),
		wasSelected = p.hasClass("Selected");

	console.log(wasSelected)
	
	if (!wasSelected) {
		p.parent().find("li.Selected").removeClass("Selected");	
		p.addClass("Selected")		
	}


}
