var rqra = new coreApi.Presenter();

function formatQuestion(question, callback) {
	displayConversations(question._id, function(conversation){
		var questionStr = "<li>" 
				+ "<div class='Question'>"
				+ "<span class='Course'>" + question._source.course + "</span>"
				+ "<a href=''>" + question._source.title + "</a>"		
				+ "</div>"
				+ conversation
				+ "</li>";
		//console.log(questionStr);
		callback(questionStr);
	})

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

//function displayQuestions(searchType, page) {
function displayQuestions(course) {
	// My conversations
	//var questionList = document.getElementById("myQuestionsList");
	var questionList = $("#myConversations").children(".Conversations");	
	var questionStr = "<ul class='Conversations'>";

	// Class conversations
	var classConversationList = $("#classConversations").children(".Conversations");	
	var classStr = "<ul class='Conversations'>";
	
	// searchQuery, searchType, courseName, weekNumber, page, callback
	rqra.searchSortedQuestions('', 'myQuestions', course, '', 0, function(data){
		var remaining = data.questions.hits.length;				
		if (data && data.errorcode === 0 && remaining > 0) {					
			$.each(data.questions.hits, function (index, item) {						
				formatQuestion(item, function(question){					
					questionStr += question;
					--remaining;					
					if (!remaining) {						
						questionStr += "<ul>";
						questionList.replaceWith(questionStr);				
					}
				});
			});
			
		}
		else {
			questionStr += "<ul>";
			questionList.replaceWith(questionStr);
		}
	});
	
	rqra.searchSortedQuestions('', 'notMyQuestions', course, '', 0, function(data){
		var remaining = data.questions.hits.length;		
		if (data && data.errorcode === 0 && remaining > 0) {
			$.each(data.questions.hits, function (index, item) {			
				formatQuestion(item, function(question){
					classStr += question;
					--remaining;
					
					if (!remaining) {					
						classStr += "<ul>";
						classConversationList.replaceWith(classStr);				
					}

				})	
			});	
		}
		else {
			classStr += "<ul>";
			classConversationList.replaceWith(classStr);
		}		
	
	})

}

function displayConversations(questionID, callback) {	
	// My conversations
	var conversationStr = "<div class='Conversation'>";

	//var topConversationList = $(".Conversation").children(".Top");
	//var allConversationList = $(".Conversation").children(".All");
	
	var topStr = "";
	var allStr = "";	

	topStr += "<div class='Top'>";
	topStr += "<h1> Top responses: </h1>";

	allStr += "<div class='All'>";
	allStr += "<h1> Conversation: </h1>";	
				
	rqra.getCommentsByQuestion(questionID, function(data) {			
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
		//topConversationList.replaceWith(topStr);
		//allConversationList.replaceWith(allStr);
		conversationStr += topStr;
		conversationStr += allStr;
		conversationStr += "</div>";
		callback(conversationStr);
		//console.log(conver)
		//return conversationStr;
	})

}

function refreshQuestions(course) {
	console.log('show the questions for this course = ' + course)
	displayQuestions(course);

}


// displays asked questions on page load
console.log('Loaded properly');

// '' = meaning all courses
displayQuestions('');