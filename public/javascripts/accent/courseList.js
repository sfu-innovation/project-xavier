var common = new coreApi.Common();
var rqra = new coreApi.Presenter();

function selectButton(selectedButton) {
	setSelected(selectedButton);

	var isNotAllTab = $(selectedButton).children().size();
	
	if (isNotAllTab) {
		getMedia(selectedButton.querySelector(".UUID").innerHTML);
		var coursePrefix = selectedButton.querySelector(".Prefix").innerHTML;
		var courseNumber = selectedButton.querySelector(".Number").innerHTML;

		//console.log('i am selected = ' + coursePrefix + ' ' + courseNumber);
		var currentCourse = coursePrefix + courseNumber;
		refreshQuestions(currentCourse.toLowerCase());		
	}
	else {
		//console.log('all selected');
		refreshQuestions('');
		getMedia('all');
	}
	
	return false;
}

function setSelected(select) {	
	var p = $(select).parent();
	var wasSelected = p.hasClass("Selected");
	
	if (!wasSelected) {
		p.parent().find("li.Selected").removeClass("Selected");	
		p.addClass("Selected")	
	}


}

function formatClass(course, callback) {	
	formatCount(course, function(count){				
		var courseStr = "<li>"
		+ "<a class='Name' href='' onclick='return selectButton(this);'>"
		+ "<span class='Prefix'>" + course.subject + "</span>"
		+ "<span class='Number'>" + course.number + "</span>"
		+ "<span class='UUID' style='display:none;'>" + course.uuid + "</span>"
		+ "</a>"
		+ "<a class='Count' href=''>" + count + "</a>"
		+ "</li>";
		callback(courseStr);
	})
	 
}

function formatCount(course, callback) {	
	var courseName = course.subject + course.number;	
	rqra.searchSortedQuestions('', '', courseName.toLowerCase(), '', 0, function(data){								
		callback(data.questions.total);
	});	
}

function formatAll() {
	return "<li class='Selected'>"
		+ "<a class='All' href='' onclick='return selectButton(this);'> All </a>"
		+ "</a>"		
		+ "</li>";
}

function displayCourseList() {
	var courseList = $("#Courses");		
	var courseStr = "<ul id='Courses'>";
	courseStr += formatAll();
	
	common.getUserCourses(function(data) {				
		if (data && data.errorcode === 0) {			
			var remaining = data.courses.length;
		
			data.courses.forEach(function(course) {						
				formatClass(course, function(formatCourse){
					courseStr += formatCourse;								
					--remaining;								
					if (!remaining) {						
						courseStr += "<ul>";											
						courseList.replaceWith(courseStr);
						getMedia($('.Selected').text());
					}
				})				
			})
		}
		else {
			courseStr += "<ul>";						
			courseList.replaceWith(courseStr);
		}
	});		
}

displayCourseList();