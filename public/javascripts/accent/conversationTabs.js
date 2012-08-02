var rqra = new coreApi.Presenter();

function formatQuestion(question, type, callback) {
	displayConversations(question._id, function(conversation){
		var followingType = formatFollowing(type, question._source.user);
		var questionStr = "<li>" 
				+ "<div class='Question'>"				
				+ "<a href='' class=" + "'" + followingType + "'>" + followingType + "</a>"				
				+ "<a class='UUID' style='display:none;'>" + question._id + "</a>"
				+ "<a href=''>" + question._source.title + "</a>"		
				+ "</div>"
				+ conversation
				+ "</li>";		
		callback(questionStr);
	})

}

function formatFollowing(type, questionUser) {
	var followType = "";	
	var sessionUser = $("#Session .Components a.UUID").text().replace(/^\s+|\s+$/g, '');

	if (type === "notMyQuestions")
		followType = "Follow";
	else if (sessionUser !== questionUser) {
		followType = "Unfollow";
	}		

	return followType;
}

				
function formatResponse(response) {
	console.log(response);
	return "<div class='Message'>"
			+ "<span class='Author'>" 
			+ "<image src='" + response._source.profile + "'>" 
			+ response._source.user
			+ "</span>"
			+ " " + response._source.body		
			+ "</div>";
}

function formatConversation(conversation) {	
	var upVote = conversation._source.upvote;
	var downVote = conversation._source.downvote;
	console.log(conversation);
	return "<div class='Message'>"
			+ "<div class='Votes'>" 
			+ "<div class='Actions'>"
			+ "<a class='Upvote' href='' onclick='return selectVote(this);'>Upvote</a>"
			+ "<a class='Downvote' href='' onclick='return selectVote(this);'>Downvote</a>"
			+ "</div>"
			+ "<a class='UUID' style='display:none;'>" + conversation._id + "</a>"
			+ "<a class='Count' href=''>" + formatVoteCount(upVote - downVote) + "</a>"  			
			+ "</div>"
			+ "<div class='Content'>" 
			+ "<span class='Author'>" 
			+ "<image src='" + conversation.profile + "'>" 
			+ conversation.user.firstName + " " + conversation.user.lastName 
			+ "</span> "
			+ conversation._source.body
			+ "</div>"
			+ "</div>";
}

function formatVoteCount(count) {
	var countStr = "";
	if (count > 0)
		countStr += "+" + count;
	else
		countStr += count;
	return countStr;

}

function selectVote(selectedVote) {
	var commentID = $(selectedVote).parent().parent().children(".UUID");
	var countNode = $(selectedVote).parent().parent().children(".Count");
	var value = parseInt(countNode.text());
	if ($(selectedVote).hasClass("Upvote")) {
		value += 1;		
		rqra.upVoteCommentById(commentID.text(), function(result){});
	}
	else {
		value -= 1;		
		rqra.downVoteCommentById(commentID.text(), function(result){});
	}	

	if (value > 0) 
		countNode.text("+" + value);
	else
		countNode.text(value);
	

	return false;
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
				formatQuestion(item, 'myQuestions', function(question){					
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
				formatQuestion(item, 'notMyQuestions', function(question){
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


function enterPressed(event, textInput) {
	
	//console.log(event.value);
	if (event.which === 13) {
		var textNode = $(textInput);

		var questionSelected = textNode.parent().parent().parent();
		var questionNode = $(questionSelected).children(".Question");
		var questionID = $(questionNode).children("a.UUID").text();

		var value = textNode.val();
				
		rqra.createComment(questionID, value, function(result) {
			// it would be nice to add directly after creating comment
			// the result should return the whole object not just top layer

			// maybe refresh the question instead of dynamically adding it
			rqra.getCommentById(result.comment._id,function(result){	
				var conversationNode = $(questionSelected).children(".Conversation");
				var allConversationList = $(conversationNode).children(".All");
				var inputText = $(allConversationList).children("input");			
				var conversationStr = formatConversation(result.comment);
				inputText.before(conversationStr);				
			});
		});
		
	}
	
}

function formatTextInput() {
	return "<input type='text' onkeydown='return enterPressed(event, this);' placeholder='Add something to the conversation' style='width: 90%; padding: 7px; margin-top: 20px'/>";
}

function displayConversations(questionID, callback) {	
	// My conversations
	var conversationStr = "<div class='Conversation'>";

	var containsTopResponse = false;
	
	var topStr = "";
	var topDivStr ="<div class='Top'>";
	var topResponseStr = "<h1> Top responses: </h1>";
	var allStr = "";	

	allStr += "<div class='All'>";
	allStr += "<h1> Conversation: </h1>";	
				
	rqra.getCommentsByQuestion(questionID, function(data) {					
			
		$.each(data.comments.hits, function (index, item) {		
			
			if (item.user.type === 1) {		
				containsTopResponse = true;
				topStr += formatResponse(item);
			}	
			else {
				allStr += formatConversation(item);
			}						
		});
		
		if (containsTopResponse) {
			topDivStr += topResponseStr;
		}
		topDivStr += topStr;
		topDivStr += "</div>";	
		allStr += formatTextInput();
		allStr += "</div>";
		//topConversationList.replaceWith(topStr);
		//allConversationList.replaceWith(allStr);
		conversationStr += topDivStr;
		conversationStr += allStr;
		conversationStr += "</div>";
		callback(conversationStr);
	})

}

function refreshQuestions(course) {
	displayQuestions(course);

}

// '' = meaning all courses
displayQuestions('');