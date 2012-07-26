
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

			console.log("Unfollow it")									
			
			followNode.parent().find("a.Follow").removeClass("Follow");
			followNode.addClass("Unfollow");
			followNode.text("Unfollow");			
				

			return false;
		});

		$(".Question a.Unfollow").live("click", function() {
			var followNode = $(this);				

			console.log("Follow it")									
			
			followNode.parent().find("a.Unfollow").removeClass("Unfollow");
			followNode.addClass("Follow");
			followNode.text("Follow");			
				

			return false;
		});
	})

})

