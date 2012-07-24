var rqra = new coreApi.Presenter();

function formatQuestion(question) {
	return "<li> <div class='Question'>"
			+ "<span class='Course'>" + question._source.course + "</span>"
			+ "<a href=''>" + question._source.title + "</a>"		
			+ "</div> </li>";
}

				
function formatResponse(response) {
	return "<div class='Message'>"
			+ "<span class='Author'>" 
			+ "<image src='../images/accent/bernie.jpg'>" 
			+ response._source.user
			+ "</span>"
			+ " " + response._source.body		
			+ "</div>";
}

function formatConversation(conversation) {	
	return "<div class='Message'>"
			+ "<div class='Votes'>" 
			+ "<a class='' href=''>" + conversation._source.upvote + "</a>"  			
			+ "</div>"
			+ "<div class='Content'>" 
			+ conversation._source.body
			+ "</div>"
			+ "</div>";
}

function displayQuestions() {
	var questionList = document.getElementById("myQuestionsList");

	// Class conversations
	var classConversationList = $("#classConversations").children(".Conversations");

	var classStr = "<ul class='Conversations'>";

	rqra.getQuestionsByUserId('jhc20', function (data) {
		if (data && data.errorcode === 0 && data.questions.hits.length > 0) {
			//console.log(data.questions.total);			
			questionList.innerHTML = "";
			
			$.each(data.questions.hits, function (index, item) {
				questionList.innerHTML += formatQuestion(item);				
			});
			
		}
	});

	rqra.getAllQuestions(0, function(data) {			
		$.each(data.questions.hits, function (index, item) {			
			if (item._source.user !== "jhc20") {	
				console.log(item._source.user);			
				classStr += formatQuestion(item);
			}						
		});

		classStr += "<ul>";

		classConversationList.replaceWith(classStr);
	})
}

function displayConversations() {
	// My conversations
	var topConversationList = $(".Conversation").children(".Top");
	var allConversationList = $(".Conversation").children(".All");
	
	var topStr = "";
	var allStr = "";	

	topStr += "<div class='Top'>";
	topStr += "<h1> Top responses: </h1>";

	allStr += "<div class='All'>";
	allStr += "<h1> Conversation: </h1>";	
				
	rqra.getCommentsByQuestion('aJfzndwdadddQuOicWWAjx7F15', function(data) {			
		$.each(data.comments.hits, function (index, item) {			
			if (item._source.isInstructor === "true") {				
				topStr += formatResponse(item);
			}	
			else {
				allStr += formatConversation(item);
			}						
		});
		topStr += "</div>";		
		allStr += "</div>";
		topConversationList.replaceWith(topStr);
		allConversationList.replaceWith(allStr);
	})

}


// displays asked questions on page load
console.log('loaded properly');

displayQuestions();
displayConversations();