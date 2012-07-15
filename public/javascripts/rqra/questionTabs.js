function displayAsked() {

}

function displayNew() {
	var rqra = new coreApi.Presenter();
	var questionList = document.getElementById("questionList");
	rqra.getNewQuestions(function (data) {
		if (data && data.errorcode === 0 && data.questions.length > 0) {
			questionList.innerHTML = "";
			$.each(data.questions, function (index, item) {
				questionList.innerHTML += "<div class='question'>"
					+ "<h2>" + item._source.title + "</h2>"
					+ "<div>Time: " + new Date(item._source.timestamp).toLocaleString() + "</div>"
					+ "<div>AskedBy: " + item._source.user + "</div>"
					+ "<p>" + item._source.body  + "</p>"
					+ "</div>";
			});
		} else {
			questionList.innerHTML = "failure";
		}
	});
}

function displayUnanswered() {
	var rqra = new coreApi.Presenter();
	var questionList = document.getElementById("questionList");
	rqra.getUnansweredQuestions(function (data) {
		if (data && data.errorcode === 0 && data.questions.length > 0) {
			questionList.innerHTML = "";
			$.each(data.questions, function (index, item) {
				questionList.innerHTML += "<div class='question'>"
					+ "<h2>" + item._source.title + "</h2>"
					+ "<div>Time: " + new Date(item._source.timestamp).toLocaleString() + "</div>"
					+ "<div>AskedBy: " + item._source.user + "</div>"
					+ "<p>" + item._source.body  + "</p>"
					+ "</div>";
			});
		} else {
			questionList.innerHTML = "failure";
		}
	});
}

function displayAll() {
	var rqra = new coreApi.Presenter();
	var questionList = document.getElementById("questionList");
	rqra.getAllQuestions(function (data) {
		if (data && data.errorcode === 0 && data.questions.length > 0) {
			questionList.innerHTML = "";
			$.each(data.questions, function (index, item) {
				questionList.innerHTML += "<div class='question'>"
					+ "<h2>" + item._source.title + "</h2>"
					+ "<div>Time: " + new Date(item._source.timestamp).toLocaleString() + "</div>"
					+ "<div>AskedBy: " + item._source.user + "</div>"
					+ "<p>" + item._source.body  + "</p>"
					+ "</div>";
			});
		} else {
			questionList.innerHTML = "failure";
		}
	});
}

// displays asked questions on page load
displayAll();
//loadAllQuestions(rqra);