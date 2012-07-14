function displayAsked() {
	var rqra = new coreApi.Presenter();
	
	var questionList = document.getElementById("questionList");
	rqra.getAllQuestions(function (data) {
		if (data && data.errorcode === 0 && data.questions.length > 0) {
			questionList.innerHTML = "";
			$.each(data.questions, function (index, item) {
				questionList.innerHTML += "<div class='question'>"
					+ "<h2>" + item._source.title + "</h2>"
					+ "<p>" + item._source.body  + "</p>"
					+ "</div>";
			});
		} else {
			questionList.innerHTML = "failure";
		}
	});
}

function displayNew() {
	var questionList = document.getElementById("questionList");
	questionList.innerHTML = "<div class='question'><h2>New  Question 1</h2><p>this is a new question</p></div>";
}

function displayUnanswered() {
	var questionList = document.getElementById("questionList");
	questionList.innerHTML = "<div class='question'><h2>Unanswered Question 1</h2><p>this is an unanswered question</p></div>";
}

function displayAll() {
	var questionList = document.getElementById("questionList");
	questionList.innerHTML = "<div class='question'><h2>All Question 1</h2><p>This is any question</p></div>";
}

// displays asked questions on page load
displayAsked();
//loadAllQuestions(rqra);