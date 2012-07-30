/*
	Question Form
	----------------------------
	Manages the page where a user asks a question
*/

function LoadCourseBox() {
	var courseBox = document.getElementById("courseBox");
	
	common.getUserCourses(function(data) {
		if (data && data.errorcode === 0) {
			courseBox.innerHTML = "";
			for(var i = 0; i < data.courses.length; ++i) {
				courseBox.innerHTML += "<option value='" + data.courses[i].uuid +  "' "
					+ "title='" + data.courses[i].subject + "" + data.courses[i].number + "'>"
					+ data.courses[i].subject + "" + data.courses[i].number 
					+ " - " + data.courses[i].title 
					+ "</option>";
			}
			RefreshWeekBox();
		}
	});
}

function refreshQuestionListHeader() {

}

function refreshQuestionsList() {

}

function RefreshWeekBox() {
	var courseId = document.getElementById("courseBox").value;
	var weekBox = document.getElementById("weekBox");
	
	rqra.getWeeksByCourseId(courseId, function(data) {
		weekBox.innerHTML = "";
		if (data && data.errorcode === 0 && data.week.length > 0) {
			data.week.sort(function(a,b) { return a.week - b.week } );
			for(var i = 0; i < data.week.length; ++i) {
				weekBox.innerHTML += "<option value='" + (i+1) + "'>"
					+ "Week " + data.week[i].week + " - " + data.week[i].topic + "</option>";
			}
		} else {
			for(var i = 1; i <= 12; ++i) {
				weekBox.innerHTML += "<option value='" + i + "'>Week " + i + "</option>";
			}
		}
	});
}

function PostQuestion() {
	var questionTitle = document.getElementById("questionField").value;
	var questionBody = document.getElementById("descriptionField").value;
	var week = parseInt(document.getElementById("weekBox").value);
	var index = document.getElementById("courseBox").selectedIndex;
	var courseName = document.getElementById("courseBox").children[index].title.toLowerCase();

	//courseName and week still gets passed in fornow, but wont be added at REST
	rqra.createQuestion(questionTitle, questionBody, courseName, week, function(data) {
		if (data && data.errorcode === 0) {
			document.location.href = "/question/" + data.question._id;
		}
	});
}

LoadCourseBox();