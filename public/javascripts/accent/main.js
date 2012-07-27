var rqra = new coreApi.Presenter();

$(document).ready(function () {

	$(function() {
		$(".Question a").live("click", function() {
			var 
				p = $(this).parent().parent(),
				wasSelected = p.hasClass("Selected");

			//console.log(wasSelected)
			
			p.parent().find("li.Selected").removeClass("Selected");

			if (!wasSelected)
				p.addClass("Selected")

			return false;
		});

		$(".Question a.Follow").live("click", function() {
			var followNode = $(this);				
												
			followNode.parent().find("a.Follow").removeClass("Follow");
			followNode.addClass("Unfollow");
			followNode.text("Unfollow");			
			
			var questionID = $(followNode.parent().find("a.UUID")).text();			
			
			rqra.followQuestionById(questionID,function(result){				
				var myConversation = $("#myConversations ul.Conversations");				
				var moveFollowSelected = followNode.parent().parent();
				
				myConversation.append(moveFollowSelected);				
				
			});	
			return false;		

		});

		$(".Question a.Unfollow").live("click", function() {
			var followNode = $(this);												
			
			followNode.parent().find("a.Unfollow").removeClass("Unfollow");
			followNode.addClass("Follow");
			followNode.text("Follow");			
				
			var questionID = $(followNode.parent().find("a.UUID")).text();
						
			rqra.unfollowQuestionById(questionID,function(result){								
				var classConversation = $("#classConversations ul.Conversations");
				var moveUnfollowSelected = followNode.parent().parent();
				
				classConversation.append(moveUnfollowSelected);					
				
			});	
			return false;		

		});
	})

})

