// keeps track of the current page
var display = displayAll;
var lastPage = 0;

// resets the page tracking
function getFirstAsked() {
	lastPage = 0;
	displayAsked(lastPage);
	display = displayAsked;
}

function getFirstNew() {
	lastPage = 0;
	displayNew(lastPage);
	display = displayNew;
}

function getFirstUnanswered() {
	lastPage = 0;
	displayUnanswered(lastPage);
	display = displayUnanswered;
}

function getFirstAll() {
	lastPage = 0;
	displayAll(lastPage);
	display = displayAll;
}

// appends data to the list
function displayAsked(page) {

}

function displayNew(page) {
	var rqra = new coreApi.Presenter();
	var questionList = document.getElementById("questionList");
	rqra.getNewQuestions(function (data) {
		if (data && data.errorcode === 0 && data.questions.length > 0) {
			if (page === 0) {
				questionList.innerHTML = "";
			}
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

function displayUnanswered(page) {
	var rqra = new coreApi.Presenter();
	var questionList = document.getElementById("questionList");
	rqra.getUnansweredQuestions(function (data) {
		if (data && data.errorcode === 0 && data.questions.length > 0) {
			if (page === 0) {
				questionList.innerHTML = "";
			}
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

function displayAll(page) {
	var rqra = new coreApi.Presenter();
	var questionList = document.getElementById("questionList");
	rqra.getAllQuestions(function (data) {
		if (data && data.errorcode === 0 && data.questions.length > 0) {
			if (page === 0) {
				questionList.innerHTML = "";
			}
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

// gets more of the current page
function displayMore() {
	lastPage++;
	display(lastPage);
}

// displays asked questions on page load
displayAll(0);