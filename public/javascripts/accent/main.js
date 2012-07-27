var rqra = new coreApi.Presenter();

$(document).ready(function () {

	$(function() {
		$(".Question a").live("click", function() {
			var 
				p = $(this).parent().parent(),
				wasSelected = p.hasClass("Selected");

			console.log(wasSelected)
			
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
			console.log(questionID);
			
			rqra.followQuestionById(questionID,function(result){
				console.log("Unfollow it");
				
			});	
			return false;		

		});

		$(".Question a.Unfollow").live("click", function() {
			var followNode = $(this);												
			
			followNode.parent().find("a.Unfollow").removeClass("Unfollow");
			followNode.addClass("Follow");
			followNode.text("Follow");			
				
			var questionID = $(followNode.parent().find("a.UUID")).text();
			console.log(questionID);			
			rqra.unfollowQuestionById(questionID,function(result){
				console.log("Follow it")			
				
			});	
			return false;		

		});
	})

})

