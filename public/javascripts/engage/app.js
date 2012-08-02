//___________ _______    ________    _____    ___________________
//\_   _____/ \      \  /  _____/   /  _  \  /  _____/\_   _____/
//|    __)_  /   |   \/   \  ___  /  /_\  \/   \  ___ |    __)_
//|        \/    |    \    \_\  \/    |    \    \_\  \|        \
///_______  /\____|__  /\______  /\____|__  /\______  /_______  /
//\/         \/        \/         \/        \/        \/



var stylePicker = new stylePicker();

jQuery(document).ready(function ($) {


	initUI();
	addColor();
//	paddingforMediumScreen();
	var engage = new coreApi.Engage();


	if (window.location.toString().indexOf('starred') != -1) {
		//if starred
		//TODO: change to a better method later

		$('.starred_btn').addClass('active');

		loadStarredArticles(engage);

	}
	else if (window.location.toString().indexOf('instructor') != -1) {
		$('.instructor_btn').addClass('active');
		loadInstructorArticles(engage);

	}
	else if (window.location.toString().indexOf('mine') != -1) {
		$('.contruibutions_btn').addClass('active');
		loadMyArticles(engage);


	}
	else if (window.location.toString().indexOf('preference') != -1) {

		var originalFormContent;

		originalFormContent = $('#edit_profile input[type=text]').serialize()


		function onClose() {	var content = $('#edit_profile input[type=text]').serialize()
			if (content != originalFormContent){
				$('.ui-tabs-selected a').css('background-color','#ff9999').attr('title','unsaved changes'); //highlight tab that contains unsaved fields
				return "popup question";
			}
		}

		window.onbeforeunload = onClose;


	}

	else if (window.location.toString().indexOf('profile') != -1) {

		loadProfileArticles(engage);
	}


	else if (window.location.toString().indexOf('article') != -1) {
		$('#owner_comment span.post_time').html(formartDate($('#owner_comment span.post_time').attr('data-time')));

		loadComments(engage);

		bindArticlePageListeners(engage);




	}

	else if (window.location.toString().indexOf('course') != -1) {

		$('.all_btn').addClass('active');
		$('.weeks-bar a').removeClass('active');

		var weekNum = (window.location.toString().split('#week'))[1];
		if (!weekNum){
			weekNum = weekConverter();
		}

		else{
			weekNum = parseInt(weekNum);
		}

		$('#article_week').val(weekNum);

		loadCourseArticles(engage, weekNum);
		$('.weeks-bar li:nth-child('+ (weekNum+1) +') a	').addClass('active');

		$(window).bind( 'hashchange', function(e) {
			var weekNum = (window.location.toString().split('#week'))[1];
			$('#article_week').val(weekNum);
			loadCourseArticles(engage, weekNum);
		});

		$('.weeks-bar a.passed').bind('click', function () {
			var weekObj = $(this);
			var week = weekObj.attr('data-week');
			if (week) {
				$('.weeks-bar a').removeClass('active');
				weekObj.addClass('active');
				$('#article_week').val(week);
				loadCourseArticles(engage, week);
			}


		})

		$('.topic_input .remove_btn').live('click',function(){
			var self = $(this);
			self.closest('.topic_input').slideUp(function(){self.closest('.topic_input').remove()});

		})

		$('#week-info .edit_btn').live('click',function(){
			var self = $(this);
			$('#week-info .topic_panel').hide();
			$('#week-info .edit_panel').slideDown('slow');

		})

		$('#week-info .add_btn').live('click',function(){
			var self = $(this);
			if ($('.topic_input').length < 5) {
				var new_topic_box = renderTopicInput('');
				$(new_topic_box).insertBefore(self.parent());
			}
		})


		$('#week-info .save_btn').live('click',function(){
			var self = $(this);
			var topics = $('.topic_input input');
			var result = "";
			$.each(topics, function(i,topic){
				console.log(topic);
				if($(topic).val()){
					result += '#' + $(topic).val();

				}
			})
			var id = $('#week-info').attr('data-week-id');
			if(id && result){
				console.log(result);
				engage.updateWeekInfo(id,result,function(data){

					if (data && data.errorcode === 0){

						updateTopicList(data.week);

					}
				})

			}


		})


	}
	else {
		$('.all_btn').addClass('active');
		$('.weeks-bar a').removeClass('active');

		var weekNum = (window.location.toString().split('#week'))[1];
		loadAllArticles(engage, weekNum);

		$('div#submitnew .error span.delete_btn').bind('click',function(){$('div#submitnew .error').fadeOut(500);});
		$('div#submitnew .msg span.delete_btn').bind('click',function(){$('div#submitnew .msg').fadeOut(500);});



		$('.selectcourse .dropdown a').bind('click',function(){
			$('div.cover').removeClass('hack');

		})



		$(window).bind( 'hashchange', function(e) {
			var weekNum = (window.location.toString().split('#week'))[1];
			loadAllArticles(engage, weekNum);
		});

		$('.weeks-bar a.passed').bind('click', function () {
			var weekObj = $(this);
			var week = weekObj.attr('data-week');
			if (week) {
				$('.weeks-bar a').removeClass('active');
				weekObj.addClass('active');
				loadAllArticles(engage, week);
			}


		})
	}




	$('.articlebox span.star_btn.unstarred').live('click', function () {
		var self = $(this);
		var resource_uuid = $(this).closest('.innercontents').attr('data-id');
		if (resource_uuid) {
			engage.starResource(resource_uuid, function (data) {
				if (data && data.errorcode === 0) {
					self.removeClass('unstarred');
					self.addClass('starred');
				}


			})
		}

	})

	$('.articlebox span.star_btn.starred').live('click', function () {
		var self = $(this);
		var resource_uuid = $(this).closest('.innercontents').attr('data-id');
		if (resource_uuid) {
			engage.unstarResource(resource_uuid, function (data) {
				if (data && data.errorcode === 0) {
					self.removeClass('starred');
					self.addClass('unstarred');
					if (window.location.toString().indexOf('starred') != -1) {
						self.parent().parent().parent().fadeOut('slow', function () {
							$(this).remove();
						});
					}
				}

			})
		}

	})

	$('.articlebox span.like_btn.disliked').live('click',function(){

		var self = $(this);
		var resource_uuid = $(this).closest('.innercontents').attr('data-id');
		if (resource_uuid){
			engage.likeResource(resource_uuid,function(data){
				console.log(data);
				if (data && data.errorcode === 0) {
					self.addClass('liked');
					self.removeClass('disliked');

					var num = parseInt(self.children().html()) + 1;
					self.children().html(num);

				}
			})

		}

	})

	$('.articlebox span.like_btn.liked').live('click',function(){

		var self = $(this);
		var resource_uuid = $(this).closest('.innercontents').attr('data-id');
		if (resource_uuid){
			engage.dislikeResource(resource_uuid,function(data){
				if (data && data.errorcode === 0) {
					self.removeClass('liked');
					self.addClass('disliked');

					var num = parseInt(self.children().html()) - 1;

					self.children().html(num);

				}

			})

		}

	})

	$('.articlebox span.delete_btn').live('click', function () {
		var article = $(this).closest('.articlebox');
		var resource_uuid = $(this).closest('.innercontents').attr('data-id');

		if (resource_uuid) {
			engage.deleteResource(resource_uuid, function (data) {
				if (data && data.errorcode === 0) {

					article.fadeOut('slow', function () {
						article.remove()

						var a = $('.articlebox');
						if( a.length <= 0){
							$('#no_resource_box').show();
						}
					});

				}

			})

		}
	})

	$('.flip_btn').bind('click',function(){
		$('div.cover').addClass('hack');
		$('div.cover').toggleClass('flip');
	})

	$('#share_article').bind('submit', function () {

		var course = $('#submitnew form option:selected').val();
		var description = $('#article_comment').val();
		var url = $('#article_url').val();
		var course_name = $('#share_article option:selected').html();
		var week = $('#article_week').val();

		var RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

		if (!(RegExp.test(url))) {
			$('#article_url').attr('placeholder', 'Please enter a valid url');

		}
		else {
			$('div#submitnew .loading').show();

			engage.shareResource({course:course, description:description, url:url, week:week}, function (data) {

				console.log(data);
				if (data) {
					if (data.errorcode === 0) {
						var new_article = renderArticlePreviewBox(data.resource);
						$('#sharebox').after(new_article);
						displayMsg('You have successfully shared a resource to <span>' + course_name + '</span>.');
					}
					else {
						displayErrorMsg('<p>We have trouble parsing this URL.</p><p> Please try another one.</p>');
					}
				}
				else {
					displayErrorMsg('Cannot connect to server. Please try agian after refresh the page.');
				}
			});

		}


		return false;

	})


	$('#upload_article').submit(function() {
		var course_name = $('#upload_article option:selected').html();

		var title = $('#upload_article #article_title').val();

		if (!title){
		$('#upload_article #article_title').attr('placeholder','Please enter a title')
		}
		else{
			$('div#submitnew .loading').show();

			$(this).ajaxSubmit({


				error: function(xhr) {
					displayErrorMsg('<p>We have trouble reading this File.</p><p> Please try another one.</p>');

				},

				success: function(data) {
					if (data && data.errorcode === 0){

						var new_article = renderArticlePreviewBox(data.resource);
						$('#sharebox').after(new_article);
						displayMsg('You have successfully shared a resource to <span>'+ course_name + '</span>.');

					}
					else{
						displayErrorMsg('<p>We have trouble reading this File.</p><p> Please try another one.</p>');

					}

				}


			});
		}


		// Have to stop the form from submitting and causing
		// a page refresh - don't forget this
		return false;
	});


	$('body').click(function(event) {

		if (!$(event.target).closest('#notification').length) {
			$('#notif').addClass('hide');
		};
		if (!$(event.target).closest('#user-menu').length) {
			$('#user_info_downdrop').addClass('hide');
		};
		if (!$(event.target).closest('#course-menu').length) {
			$('#course_list').addClass('hide');
		};

		if (!$(event.target).closest('#slide_courses').length && !$(event.target).closest('#courses_box').length) {
			$('#courses_box').hide();
		};

		if (!$(event.target).closest('#slide_menu').length && !$(event.target).closest('#menu_box').length) {
			$('#menu_box').hide();
		};

		if (!$(event.target).closest('#slide_share').length && !$(event.target).closest('#mobile_share_box').length) {
			$('#mobile_share_box').hide();
		};

	});

	$('a.notification').live('click', function () {


		var id = $(this).attr('data-id');
		var url =  $(this).attr('data-url');
		if (id) {

			engage.deleteNotification(id, function (data) {
				// success or not... we are redirect the page!
				window.location =  url;



			})
		}


	})


	setTimeout(updatePostTime,30000); // update the time stamp every 30 seconds

	getAllNotifications();

});

function initUI() {
	$('dl.tabs dd a').on('click.fndtn', function (event) {
		activateTab($(this).parent('dd'));
	});

	if (window.location.hash) {
		activateTab($('a[href="' + window.location.hash + '"]'));
		$.foundation.customForms.appendCustomMarkup();
	}

	/* ALERT BOXES ------------ */
	$(".alert-box").delegate("a.close", "click", function (event) {
		event.preventDefault();
		$(this).closest(".alert-box").fadeOut(function (event) {
			$(this).remove();
		});
	});

	/* PLACEHOLDER FOR FORMS ------------- */
	/* Remove this and jquery.placeholder.min.js if you don't need :) */
	$('input, textarea').placeholder();

	/* TOOLTIPS ------------ */
	$(this).tooltips();

	/* UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE6/7/8 SUPPORT AND ARE USING .block-grids */
	//  $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'left'});
	//  $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'left'});
	//  $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'left'});
	//  $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'left'});


	/* DROPDOWN NAV ------------- */

	var lockNavBar = false;
	/* Windows Phone, sadly, does not register touch events :( */
	if (Modernizr.touch || navigator.userAgent.match(/Windows Phone/i)) {
		$('.nav-bar a.flyout-toggle').on('click.fndtn touchstart.fndtn', function (e) {
			e.preventDefault();
			var flyout = $(this).siblings('.flyout').first();
			if (lockNavBar === false) {
				$('.nav-bar .flyout').not(flyout).slideUp(500);
				flyout.slideToggle(500, function () {
					lockNavBar = false;
				});
			}
			lockNavBar = true;
		});
		$('.nav-bar>li.has-flyout').addClass('is-touch');
	} else {
		$('.nav-bar>li.has-flyout').hover(function () {
			$(this).children('.flyout').show();
		}, function () {
			$(this).children('.flyout').hide();
		});
	}

	/* DISABLED BUTTONS ------------- */
	/* Gives elements with a class of 'disabled' a return: false; */

	/* SPLIT BUTTONS/DROPDOWNS */
	$('.button.dropdown > ul').addClass('no-hover');

	$('.button.dropdown').on('click.fndtn touchstart.fndtn', function (e) {
		e.stopPropagation();
	});
	$('.button.dropdown.split span').on('click.fndtn touchstart.fndtn', function (e) {
		e.preventDefault();
		$('.button.dropdown').not($(this).parent()).children('ul').removeClass('show-dropdown');
		$(this).siblings('ul').toggleClass('show-dropdown');
	});
	$('.button.dropdown').not('.split').on('click.fndtn touchstart.fndtn', function (e) {
		e.preventDefault();
		$('.button.dropdown').not(this).children('ul').removeClass('show-dropdown');
		$(this).children('ul').toggleClass('show-dropdown');
	});
	$('body, html').on('click.fndtn touchstart.fndtn', function () {
		$('.button.dropdown ul').removeClass('show-dropdown');
	});

	// Positioning the Flyout List
	var normalButtonHeight = $('.button.dropdown:not(.large):not(.small):not(.tiny)').outerHeight() - 1,
		largeButtonHeight = $('.button.large.dropdown').outerHeight() - 1,
		smallButtonHeight = $('.button.small.dropdown').outerHeight() - 1,
		tinyButtonHeight = $('.button.tiny.dropdown').outerHeight() - 1;

	$('.button.dropdown:not(.large):not(.small):not(.tiny) > ul').css('top', normalButtonHeight);
	$('.button.dropdown.large > ul').css('top', largeButtonHeight);
	$('.button.dropdown.small > ul').css('top', smallButtonHeight);
	$('.button.dropdown.tiny > ul').css('top', tinyButtonHeight);


}


/*** load Comments and Render the HTML on */
function loadComments(engage) {
	//hidden info that backend passes to front end javascript
	//find the id we rquired to call the REST api
	var id = $('#hidden-info').attr('data-resource-id');
	if (id) {
		// using our REST api library to request a list of json objects from backend
		engage.getCommentsByResourceId(id, function (data) {
			if (data) {
				if (data.errorcode === 0) {
					//if we got data form backend and there is no error, start to render the data
					console.log(data);
					//we render comment thread by thread, append the result immediately to the page
					$.each(data.comments, function (index, item) {

						comment = renderCommentThread(item);

						$('#comments > ol').append(comment);
					});
				}

			}


		})
	}

}

function renderCommentThread(item) {

	var html = renderBox(item, "comment");

	if (item.replies && item.replies.length > 0) {

		$.each(item.replies, function (index, reply) {

			html += renderBox(reply, "replies");
		});


	}

	html = '<li class="thread"><ol>' + html + '</ol></li>';

	return html;
}

// two types of comment, the threaded head comment, and its replies
//they have very similar structure, so we only need change the css Class

function renderBox(item,type){
	// the comment content is the special deleted pattern, don't render it
	if (item.body === "!@#$%^&*()"){
		return '<li class = "'+type+'">This comment has been deleted</li>'
	}

	var html = '<li class="'+type+'" '+ 'data-reply-type="'+ type +'" data-target-uuid="'+ item.target_uuid +'" data-parent-uuid="'+ item.uuid + '"' + 'data-reply-to="'+ item.user.firstName +' ' + item.user.lastName+'"'  +'>';

	// if user is the owner of the item, render the edit button
	if (item.owner){
		html += '<span class="edit_btn">Edit</span>';
	}

	html	+= '<a href="/profile/'+ item.user.uuid +'" class="avatar">'
		+ '<img src="' + (item.avatar ? item.avatar:'/images/engage/default_profile.png') + '"  />' + '</a>'
		+ '<span class="name">' + item.user.firstName + ' ' + item.user.lastName
		+ '</span>'
		+ (item.reply_to ? ('<span class="reply_to">in reply to '+ item.reply_to+' .</span>') : '')
		+ '<p>' + item.body
		+ '</p>';

	// if user is the author of the comment, render edit panel
	if (item.owner){

		html	+= '<div class="comment_control" style = "display:none;"><input type="text" value="'+  item.body+ '"/>'
			+'<a class="tiny button save_btn">Save</a>'
			+'<a class="tiny button delete_btn">Delete</a>'
			+'<a class="tiny button cancel_btn" >Cancel</a>'
			+ '</div>'
		;
	}

	// if the created date doesn't match the updated date,   it means that the post has been edited.
	if (item.createdAt === item.updatedAt || !item.updatedAt){

		html +=	'<div class="post_time_box">' + ' <span>Posted </span><span class="post_time" data-time="'+item.createdAt+'">' + formartDate(item.createdAt)
			+ ' .</span>';
	}
	else{
		html +=	' <span>Updated </span><span class="post_time" data-time="'+item.updatedAt+'">' + formartDate(item.createdAt)
			+ ' .</span>' ;
	}


	html	+= ' <span class="like_reply"><span class="like_btn">Like (' + '<em>' +item.like + '</em>' +')'
		+ '</span><a class="reply_click" '       +'> Reply <span class="typicn forward"></span> </a></span>'

		+ '</li>'  + ' </div>';

	return html;
}


//bind listener to all the buttons so they will do actions

function bindArticlePageListeners(engage) {

	//update like number after user clicks like on comment
	$('#comments li .like_btn').live('click',function(){
		var self = $(this);
		var list = self.closest('li');
		var id = list.attr('data-parent-uuid');
		engage.likeCommentById(id,function(data){
			if (data && data.errorcode === 0){
				var num = parseInt(self.children().html()) + 1;
				self.children().html(num);
				self.addClass('dislike_btn');
				self.removeClass('like_btn');


			}
		})

	})


	//show hidden edit panel after user click edit on their comments
	$('#comments li .edit_btn').live('click',function(){
		var self = $(this);
		var list = self.closest('li');
		var p = list.children('p');

		var control = list.children('.comment_control');
		p.hide();
		control.slideDown('slow');
	})

	//close edit panel after user click cancel in edit panel
	$('#comments li .cancel_btn').live('click',function(){
		var self = $(this);
		var list = self.closest('li');
		var p = list.children('p');

		var control = list.children('.comment_control');
		p.show();
		control.slideUp('slow');
	})


	//delete comment after
	$('#comments li .delete_btn').live('click',function(){
		var self = $(this);
		var list = self.closest('li');
		var p = list.children('p');
		var control = list.children('.comment_control');

		var id = list.attr('data-parent-uuid');

		// update the original comment to special text pattern indicates the comments are deleted
		// since we do not destroy the tree structure.

		var text = "!@#$%^&*()";

		engage.updateCommentById(id,text,function(data){
			console.log(data);
			if (data && data.errorcode === 0){

				list.html('This comment has been deleted');
				p.show();
				control.hide();

			}


		})

	})

	//save the comments after user click save.
	$('#comments li .save_btn').live('click',function(){
		var self = $(this);
		var list = self.closest('li');
		var p = list.children('p'); // this is the comment content displayed to user
		var control = list.children('.comment_control');

		// getting the comment id we need from HTML 5 data- Attributes,
		// we saved the id here when rendering
		var id = list.attr('data-parent-uuid');


		var text = control.children('input').val();   // this is the value from the edit input box

		//calling REST api to update the comment by id
		engage.updateCommentById(id,text,function(data){
			console.log(data);
			if (data && data.errorcode === 0){

				p.html(text);   //update the old comment content with new text inputted by user
				p.show();       //show the comment content
				control.hide(); //hide the edit panel

			}


		})

	})

	//create and show reply box on the fly when reply is clicked
	$('.reply_click').live('click',function(){

		$('.reply_box').remove();   //remove all other reply box
		var self = $(this);
		var list = self.closest('li');

		var target_uuid = list.attr('data-target-uuid');
		var reply_to = list.attr('data-reply-to');
		var parent_uuid = list.attr('data-parent-uuid');


		// if the reply is replying to a orginal uploader's comment
		// put it in the bottom as a new thread
		if (self.attr('data-reply-type') === 'super'){
			target_uuid = self.attr('data-target-uuid');
			reply_to = $('#owner_comment .name').html();//the name of user it replies to
			var new_reply_box = renderReplyBox("comment",reply_to,target_uuid,null);
//
			$(new_reply_box).insertAfter('#owner_comment').slideDown('slow',function(){$('form input#reply_content').focus();});

		}

		// if the reply is replying to a first comment in thread
		// put it in the bottom of this thread
		else if(list.attr('data-reply-type') === 'comment'){

			var new_reply_box = renderSubReplyBox("replies",reply_to,target_uuid,parent_uuid);
			$(new_reply_box).insertAfter(self.closest('.comment')).slideDown('slow',function(){$('form input#reply_content').focus();});



		}

		// if the reply is replying to another reply
		// put it in the bottom of this thread

		else if(list.attr('data-reply-type') === 'replies'){

			var new_reply_box = renderSubReplyBox("replies",reply_to,target_uuid,parent_uuid);
			$(new_reply_box).insertAfter(self.closest('.replies')).slideDown('slow',function(){$('form input#reply_content').focus();});


		}


	})

	//when reply form on submit, send the data via AJAX in the background
	//Then create a new comment box with the content user just posted
	//put it in somewhere it belongs to

	$('.reply_box form').live('submit',function(){
		var self = $(this);
		var comment = {};
		comment.target_uuid = $('form input#comment_target').val();
		comment.parent_uuid = $('form input#comment_parent').val();
		comment.body = $('form input#reply_content').val();

		if (comment.body){

		engage.createComment(comment,function(data){


			if (data && data.comment){

				data.comment.reply_to =  $('.reply_box form').attr('data-reply-to');
				var type = $('.reply_box form').attr('data-reply-type');
				console.log(data);
				if (type){
					$('.reply_box').hide();
					var new_comment = renderBox(data.comment,type);
					if (type === "replies"){

						$(new_comment).appendTo(self.closest('ol'));

						$.scrollTo(self.closest('ol').children('li').filter(':last'),900);

					}
					else if (type === "comment"){
						new_comment = '<li class="thread"><ol>'+ new_comment +'</ol></li>'
						$(new_comment).appendTo('#comments > ol');
						$.scrollTo($('#comments > ol > li:last-child'),900);
					}

					$('.reply_box').remove();
				}



			}

		})

		}

		else{
			$('form input#reply_content').attr('placeholder','Please fill in the comment.')
		}
		return false;
	})


	//other bindings for article toolbox buttons

	$('.article_options span.invert_btn ').bind('click', function () {
		$("div#article_container .columns:first-child").toggleClass('night');
		$(".article_options").toggleClass('night');
		return false;
	})

	$('.article_options span.textsize_btn ').bind('click', function () {
		$("#article").toggleClass('larger');

		return false;
	})

	$('.article_options_mobile span.invert_btn ').bind('click', function () {
		$("div#article_container .columns:first-child").toggleClass('night');
		$(".article_options").toggleClass('night');
		return false;
	})

	$('.article_options_mobile span.textsize_btn ').bind('click', function () {
		$("#article").toggleClass('larger');

		return false;
	})




	$('.article_options span.star_btn.unstarred').live('click', function () {
		var self = $(this);
		var resource_uuid = $('#hidden-info').attr('data-resource-id');
		if (resource_uuid) {
			engage.starResource(resource_uuid, function (data) {
				if (data && data.errorcode === 0) {
					self.removeClass('unstarred');
					self.addClass('starred');
				}


			})
		}

	})

	$('.article_options span.star_btn.starred').live('click', function () {
		var self = $(this);
		var resource_uuid = $('#hidden-info').attr('data-resource-id');
		if (resource_uuid) {
			engage.unstarResource(resource_uuid, function (data) {
				if (data && data.errorcode === 0) {
					self.removeClass('starred');
					self.addClass('unstarred');
					if (window.location.toString().indexOf('starred') != -1) {
						self.parent().parent().parent().fadeOut('slow', function () {
							$(this).remove();
						});
					}
				}

			})
		}

	})

	$('.article_options span.like_btn.disliked').live('click',function(){

		var self = $(this);
		var resource_uuid = $('#hidden-info').attr('data-resource-id');
		if (resource_uuid){
			engage.likeResource(resource_uuid,function(data){
				console.log(data);
				if (data && data.errorcode === 0) {
					self.addClass('liked');
					self.removeClass('disliked');

					var num = parseInt(self.children().html()) + 1;
					self.children().html(num);

				}
			})

		}

	})

	$('.article_options span.like_btn.liked').live('click',function(){

		var self = $(this);
		var resource_uuid = $('#hidden-info').attr('data-resource-id');
		if (resource_uuid){
			engage.dislikeResource(resource_uuid,function(data){
				if (data && data.errorcode === 0) {
					self.removeClass('liked');
					self.addClass('disliked');

					var num = parseInt(self.children().html()) - 1;

					self.children().html(num);

				}

			})

		}

	})
}

function loadInstructorArticles(engage) {


	engage.getResourcesByCourseUUIDs(function (data) {

		if (data) {


			if (data.errorcode == 0) {

				$('.articlebox').remove();
				//$('#contents').empty();
				console.log(data);
				$.each(data.resources, function (index, item) {

					console.log(item);
					if (item.user.type === 1) {
						article = renderArticlePreviewBox(item);
						$('#contents').append(article);
					}

				});

			}

			else {

			}
		}
		else {

		}


	})
}


function loadMyArticles(engage) {

	engage.getResourcesByCurrentUserId(function (data) {
		if (data) {

			if (data.errorcode == 0) {

				$('.articlebox').remove();
				//$('#contents').empty();
				console.log(data);
				$.each(data.resources, function (index, item) {

					console.log(item);
					article = renderArticlePreviewBox(item);


					$('#contents').append(article);
				});

			}

			else {

			}
		}
		else {

		}


	})
}

function loadProfileArticles(engage){
	var id = $('#hidden-info').attr('data-user-id');

	if (id){
		engage.getResourcesByUserId(id, function (data) {
			if (data) {

				if (data.errorcode == 0) {

					$('.articlebox').remove();
					//$('#contents').empty();
					console.log(data);
					$.each(data.resources, function (index, item) {

						console.log(item);
						article = renderArticlePreviewBox(item);


						$('#contents').append(article);
					});

				}

				else {

				}
			}
			else {

			}


		})
	}
}

function loadCourseArticles(engage, week) {
	var id = $('#hidden-info').attr('data-course-id');

	if (id) {
		if (week) {

			engage.getWeekInfoByCourseIdAndWeekNum(id,week,function(data){
				if (data){
					if (data.errorcode ===0){
						console.log(data);
						var weekbox = renderWeekInfoBox(data.week);
						$('.weekbox').remove();
						$(weekbox).insertAfter($('#info').parent())
//						$('#contents').append(weekbox);
					}
					else{

					}
				}
				else{

				}


			})




			engage.getResourcesByCourseUUIDAndWeek(id, week, function (data) {
				if (data) {
					if (data.errorcode === 0) {

						if( data.resources <= 0){
							$('#no_resource_box').show();
						}
						$('.articlebox').remove();

						console.log(data);
						$.each(data.resources, function (index, item) {

							if (item.user.type === 1){
								var article = renderArticlePreviewBox(item);
								$('#contents').append(article);
							}



						});
						$.each(data.resources, function (index, item) {

							if (item.user.type !== 1){
								var article = renderArticlePreviewBox(item);
								$('#contents').append(article);
							}



						});

					}

					else {
						var a = $('.articlebox');
						if( a.length <= 0){
							$('#no_resource_box').show();
						}
					}
				}
				else {
					var a = $('.articlebox');
					if( a.length <= 0){
						$('#no_resource_box').show();
					}
				}
			})
		}
		else {
			engage.getResourcesByCourseUUID(id, function (data) {
				if (data) {

					if (data.errorcode == 0) {

						$('.articlebox').remove();
						//$('#contents').empty();
						console.log(data);
						$.each(data.resources, function (index, item) {

							console.log(item);
							article = renderArticlePreviewBox(item);


							$('#contents').append(article);
						});

					}

					else {

					}
				}
				else {

				}


			})
		}


	}


}


function loadAllArticles(engage, week) {
	if (week) {
		engage.getResourcesByCourseUUIDsAndWeek(week, function (data) {
			if (data) {
				if (data.errorcode == 0) {

					$('.articlebox').remove();
					//$('#contents').empty();
					console.log(data);

					if( data.resources.length <= 0){
						$('#no_resource_box').show();
					}


					$.each(data.resources, function (index, item) {

						console.log(item);
						article = renderArticlePreviewBox(item);


						$('#contents').append(article);
					});

				}

				else {
					var a = $('.articlebox');
					if( a.length <= 0){
						$('#no_resource_box').show();
					}
				}
			}
			else {
				var a = $('.articlebox');
				if( a.length <= 0){
					$('#no_resource_box').show();
				}
			}
		})

	}
	else {
		engage.getResourcesByCourseUUIDs(function (data) {
			if (data) {
				if (data.errorcode == 0) {

					$('.articlebox').remove();
					//$('#contents').empty();
					console.log(data);
					if( data.resources.length <= 0){
						$('#no_resource_box').show();
					}
					$.each(data.resources, function (index, item) {

						console.log(item);
						article = renderArticlePreviewBox(item);


						$('#contents').append(article);
					});

				}

				else {
					var a = $('.articlebox');
					if( a.length <= 0){
						$('#no_resource_box').show();
					}
				}
			}
			else {
				var a = $('.articlebox');
				if( a.length <= 0){
					$('#no_resource_box').show();
				}
			}


		})
	}

}

function loadStarredArticles(engage) {


	engage.getStarredResources(function (data) {
//	engage.getResourcesByCourseUUIDs(function(data){
		if (data) {
			if (data.errorcode == 0) {

				$('.articlebox').remove();
				//$('#contents').empty();
				console.log(data);
				$.each(data.resources, function (index, item) {

					console.log(item);
					article = renderArticlePreviewBox(item);


					$('#contents').append(article);
				});

			}

			else {

			}
		}
		else {

		}


	})
}

function renderTopicInput(topic){
	var html = '<div class="topic_input"><input  type="text" placeholder="#" value="'+topic+'" /> '
	+  ''
	+  '<span class="tiny button remove_btn">-</span></div>'
			;

	return html;
}

function updateTopicList(item){

	var weekBox =
		'<h4>Week '
			+ item.week
			+ '</h4>' + '<span id="topic_span">TOPICS:</span>';
	if (!item.topic) {
		weekBox += '<p>' +
			'Instructor has not set up weekly topics yet.' +
			'</p>';
	}
	else {
		var topic_list = item.topic.split('#');
		if (topic_list[0] !== "") {
			weekBox += '<p>' +
				topic_list[0] +
				'</p>';
		}
		else {
			topic_list.shift();
			weekBox += '<ul>'
			$.each(topic_list, function (i, topic) {
				weekBox += '<li>' + topic + '</li>'
			})
			weekBox += '</ul>';


			console.log(topic_list);
		}


	}
	weekBox += '<span class="button small edit_btn">Edit</span>';

	$('#week-info .topic_panel').html(weekBox);
	$('#week-info .edit_panel').hide();
	$('#week-info .topic_panel').slideDown('slow');

}

function renderWeekInfoBox(item) {

	var weekBox =
		'<div class="three columns weekbox">'
			+ '<div id="week-info" data-week-id="' + item.uuid + '" class="innercontents">'


			+ '<div class="topic_panel">'
			+ '<h4>Week '
			+ item.week
			+ '</h4>' + '<span id="topic_span">TOPICS:</span>';
	if (!item.topic) {
		weekBox += '<p>' +
			'Instructor has not set up weekly topics yet.' +
			'</p>';
	}
	else {
		var topic_list = item.topic.split('#');
		if (topic_list[0] !== "") {
			weekBox += '<p>' +
				topic_list[0] +
				'</p>';
		}
		else {
			topic_list.shift();
			weekBox += '<ul>'
			$.each(topic_list, function (i, topic) {
				weekBox += '<li>' + topic + '</li>'
			})
			weekBox += '</ul>';


			console.log(topic_list);
		}


	}
	if (item.owner) {
		weekBox += '<span class="button small edit_btn">Edit</span>';
	}
	weekBox += '</div>';


	//if is prof

	if (item.owner) {

		weekBox += '<div class="edit_panel">';
		weekBox += '<h4>Week '
			+ item.week
			+ '</h4>'+ '<span id="topic_span">TOPICS:</span>';
		if (!item.topic) {
			weekBox += renderTopicInput('');


		}
		else {
			var topic_list = item.topic.split('#');
			if (topic_list[0] !== "") {
				weekBox += renderTopicInput(topic_list[0]);
			}
			else {
				topic_list.shift();

				$.each(topic_list, function (i, topic) {
					weekBox += renderTopicInput(topic);
				})

				console.log(topic_list)
			}
		}

		weekBox += '<div id="week_topic_btn">' +
			'<span class="small button add_btn">Add</span>' +
			'<span class="button small save_btn">Save</span>' + '</div>';


		weekBox += '</div>';

	}


	weekBox += '</div></div>'

	return weekBox;
}

function addColor(){
	var courses = $('#course_list li a');
	var mobile_courses = $('#courses_box .courses a');

	courses.each(function(i,course){
		var coursename = $(course).html().replace(/\s/g, "");
		$(course).addClass(stylePicker.getStyle(coursename));
	})

	mobile_courses.each(function(i,course){
		var coursename = $(course).html().replace(/\s/g, "");

		$(mobile_courses).addClass(stylePicker.getStyle(coursename));
	})


}

function renderArticlePreviewBox(item) {

	$('#no_resource_box').hide();
	var article =
		'<div class="three columns articlebox">'
			+ '<div class="innercontents ' + stylePicker.getStyle(item.course.subject+item.course.number) + '" data-id="' + item.uuid + '" id="' + item.uuid + '">'
			+ isOwner(item.owner)

			+ '<a href="/profile/'+ item.user.uuid +'">'
			+ '<img src="' + (item.user.avatar ? item.user.avatar:'/images/engage/default_profile.png') + '" class="avatar" />' + '</a>'


			+ '<div class="post_details"> '
			+ '<span><a href="/profile/'+ item.user.uuid +'">' + item.user.firstName + " " + item.user.lastName + '</a></span>'
			+ isProf(item.user.type) //return nothing if not

			+ '<p>Posted '
			+ '<span class="post_time" data-time="'+ item.createdAt +'"> ' + formartDate(item.createdAt) + '</span>'
			+ ' in '
			+ '<span class="coursename">' + '<a class="'+stylePicker.getStyle(item.course.subject+item.course.number)+'" href="/course/' + item.course.subject + '-' + item.course.number + '-' + item.course.section + '#week' + item.week + '">' + item.course.subject + " " + item.course.number 
			+ '</a>'
			+ '</span>'

			+ '</p>'
			+ '</div>'

			//end of post_details

			+ renderPreviewImage(item)
			//end of innerwrap

			+ '<h5>'
			+ '<a '+ ((!item.thumbnail && item.fileType ==='html' )?'class="noimage"':'')  +'href="/article/' + item.uuid + '" style="font-size:'+  renderTitleFontSize(item)   +'px">' + item.title + '</a></h5>'

			+ '<div class="articlepreview">' + '<p>' + renderExcerpt(item.excerpt) + '</p>'
			+ '</div>'
			+ '<div class="likescomments">'
			+ renderStar(item.starred)
			+ renderLike(item)

			+ '<a href="/article/'+item.uuid+'"><span class="comment_btn">Comments (' + item.totalComments + ') </span></a>'
			+ '</div>'
			+ '</div>'
			+ '</div>';
	return article;

}

function isOwner(owner){
	if (owner) return '<span class="delete_btn">X</span>'
	else return ""
}


function activateTab($tab) {
	var $activeTab = $tab.closest('dl').find('dd.active'),
		contentLocation = $tab.children('a').attr("href") + 'Tab';

	// Strip off the current url that IE adds
	contentLocation = contentLocation.replace(/^.+#/, '#');

	// Strip off the current url that IE adds
	contentLocation = contentLocation.replace(/^.+#/, '#');

	//Make Tab Active
	$activeTab.removeClass('active');
	$tab.addClass('active');

	//Show Tab Content
	$(contentLocation).closest('.tabs-content').children('li').hide();
	$(contentLocation).css('display', 'block');
}


function formartDate(old_date) {
	var now = new Date();
	var post_time = new Date(Date.parse(old_date));
	var prettytime = formatAgo(post_time, null, now);
	return prettytime;
}


function isProf(user_type) {
	if (user_type === 1) {
		return '<span id="prof" title="instructor"><img src="/images/engage/icon/16x16/Instructor_v1.png"/></span>'
	}
	else {
		return '';
	}
}

function renderStar(starred) {
	if (starred) {
		return '<span class="star_btn starred">Star</span>';
	}
	else {
		return '<span class="star_btn unstarred">Star</span>'
	}
}

function renderLike(item) {
	if (item.liked) {
		return '<span class="like_btn liked">Like (<em>' + item.likes + '</em>) </span>'
	}
	else {
		return '<span class="like_btn disliked">Like (<em>' + item.likes + '</em>) </span>'
	}
}


function renderPreviewImage(item) {
	var previewImage = "";

	if (item.thumbnail && item.fileType === "html" ){
		previewImage= '<div class="innerwrap" style=\''
			//IE
			+'background-image: url("'
			+ item.thumbnail + '");'
			//CHROME SAFARI
			+'background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(0,0,0,0.62)), color-stop(27%,rgba(0,0,0,0.12)), color-stop(41%,rgba(0,0,0,0.01)), color-stop(53%,rgba(0,0,0,0.06)), color-stop(100%,rgba(0,0,0,0.48))), url("'
			+ item.thumbnail + '");'

			//FIREFOX
			+'background-image: -moz-linear-gradient(top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 27%, rgba(0,0,0,0.01) 42%, rgba(0,0,0,0.06) 53%, rgba(0,0,0,0.48) 100%), url("'
			+ item.thumbnail + '");'
//		+ 'http://www.smashinglists.com/wp-content/uploads/2010/02/persian.jpg'
			+ '\'>'
			+ '</div>'
	}

	else if (item.fileType === "pdf"){
		previewImage= '<div class="innerwrap" style=\''
			//IE
			+'background-image: url("'
			+ '/images/engage/pdf_icon.png' + '");'
			//CHROME SAFARI
			+'background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(0,0,0,0.62)), color-stop(27%,rgba(0,0,0,0.12)), color-stop(41%,rgba(0,0,0,0.01)), color-stop(53%,rgba(0,0,0,0.06)), color-stop(100%,rgba(0,0,0,0.48))), url("'
			+ '/images/engage/pdf_icon.png' + '");'

			//FIREFOX
			+'background-image: -moz-linear-gradient(top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 27%, rgba(0,0,0,0.01) 42%, rgba(0,0,0,0.06) 53%, rgba(0,0,0,0.48) 100%), url("'
			+ '/images/engage/pdf_icon.png' + '");'
//		+ 'http://www.smashinglists.com/wp-content/uploads/2010/02/persian.jpg'
			+ '\'>'
			+ '</div>'
	}

	else if (item.fileType === "doc" || item.fileType === "docx"){
		previewImage= '<div class="innerwrap" style=\''
			//IE
			+'background-image: url("'
			+ '/images/engage/word_icon.png' + '");'
			//CHROME SAFARI
			+'background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(0,0,0,0.62)), color-stop(27%,rgba(0,0,0,0.12)), color-stop(41%,rgba(0,0,0,0.01)), color-stop(53%,rgba(0,0,0,0.06)), color-stop(100%,rgba(0,0,0,0.48))), url("'
			+ '/images/engage/word_icon.png' + '");'

			//FIREFOX
			+'background-image: -moz-linear-gradient(top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 27%, rgba(0,0,0,0.01) 42%, rgba(0,0,0,0.06) 53%, rgba(0,0,0,0.48) 100%), url("'
			+ '/images/engage/word_icon.png' + '");'
			+ '\'>'
			+ '</div>'
	}

	else if (item.fileType === "ppt" || item.fileType === "pptx"){
		previewImage= '<div class="innerwrap" style=\''
			//IE
			+'background-image: url("'
			+ '/images/engage/ppt_icon.png' + '");'
			//CHROME SAFARI
			+'background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(0,0,0,0.62)), color-stop(27%,rgba(0,0,0,0.12)), color-stop(41%,rgba(0,0,0,0.01)), color-stop(53%,rgba(0,0,0,0.06)), color-stop(100%,rgba(0,0,0,0.48))), url("'
			+ '/images/engage/ppt_icon.png' + '");'

			//FIREFOX
			+'background-image: -moz-linear-gradient(top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 27%, rgba(0,0,0,0.01) 42%, rgba(0,0,0,0.06) 53%, rgba(0,0,0,0.48) 100%), url("'
			+ '/images/engage/ppt_icon.png' + '");'
//		+ 'http://www.smashinglists.com/wp-content/uploads/2010/02/persian.jpg'
			+ '\'>'
			+ '</div>'
	}

	else{
		previewImage= '<div class="innerwrap" style=\''
			+ 'opacity: 1;'
			//IE
			+'background-image: url("'
			+ '/images/engage/default_thumbnail.jpg' + '");'
			+ '\'>'
			+ '</div>'
	}





	return  previewImage


}

//ajust text font size according to length
function renderTitleFontSize(item){
	var len =  item.title.length;
	if (len <= 27) return 30;
	if (len <= 45 ) return 28;
	else return 25;
}

function renderExcerpt(excerpt) {
	if (excerpt) {

		return excerpt;
	}
	else {
		return '';
	}
}


// a class that choose unique box color style for given subject
// if the subject is new, give a new color, otherwise use the old one;

function stylePicker() {
	var available_styles = ['color-1', 'color-2','color-3', 'color-4','color-5', 'color-6'];
	var subjects = {};

	this.getStyle = function (subject) {

		if (subjects[subject]) {
			return subjects[subject]

		}
		else {
			var result = available_styles.shift();
			if (!result) {
				result = "box-style-1";
			}
			subjects[subject] = result;
			return result;
		}

	}


}

function parseDate(input) {
	var parts = input.match(/(\d+)/g);
	return new Date(parts[0], parts[1]-1, parts[2]);
}

//2012-07-21T00:00:24.000Z
function weekConverter() {

	Date.prototype.getWeek = function () {
		var onejan = new Date(this.getFullYear(), 0, 1);
		return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
	}

	var one_week = 7 * 24 * 60 * 60 * 1000;
	var current_date = new Date();
	var semester_start_date = new Date(Date.parse('2012-05-07T07:00:00.000Z'));
	return current_date.getWeek() - semester_start_date.getWeek() + 1;


}

function renderReplyBox (reply_type,reply_to, comment_target, comment_parent){
	var html = '<div style="display:none" class="reply_box"><span>in reply to ' + reply_to + '.</span><form name="add_comment" data-reply-to="'+ reply_to +'"'
		+ ' data-reply-type="'+ reply_type+'"'

		+'>'

		+ '<input  type="text" id="reply_content" placeholder="Type in a comment">'
		+ '<input type="submit" value="Post" class="submit_btn">'
		+ '<input type="hidden" id="comment_target" value="'
		+ comment_target
		+ '">';

		if(comment_parent){
			html += '<input type="hidden" id="comment_parent" value="'
				+ comment_parent
			+ '">'
		}



		html += '</form></div>';

	return html;
}

function renderNotificationBox(item){
	var html = '<li>';
	html += '<a class="notification" data-id ="'+item.id+'" data-url="/article/'+item.target+'"><img src="'
		+ (item.avatar ? item.avatar:'/images/engage/default_profile.png')
		+ '" class="user_avatar">'
	+ '<p class="msg">'
		+ '<span class="username">'+item.user.firstName+' </span>';
	html	+= 'replied on your message:  "' + (item.description).slice(0,40) + '..."'
		+'</p>';


	html += '</a></li>';

	return html;
}

function renderSubReplyBox (reply_type,reply_to, comment_target, comment_parent){
	var html = '<li style="display:none" class="reply_box replies"><span>in reply to ' + reply_to + '.</span><form name="add_comment" data-reply-to="'+ reply_to +'"'
		+ ' data-reply-type="'+ reply_type+'"'

		+'>'
		+ '<input  type="text" id="reply_content" placeholder="Type in a comment">'
		+ '<input type="submit" value="Post" class="submit_btn">'
		+ '<input type="hidden" id="comment_target" value="'
		+ comment_target
		+ '">'
		+ '<input type="hidden" id="comment_parent" value="'
		+ comment_parent
		+ '">'
		+ '</form></li>'

	return html;
}

function updatePostTime(){
	 var time_spans = $('.post_time');
	$.each(time_spans, function(i,item){
		$(item).html(formartDate($(item).attr('data-time')));
	})

//	$('.post_time').html(formartDate($('.post_time').attr('data-time')))
	setTimeout(updatePostTime,30000);
}

function displayMsg(msg){

	$('#submitnew .msg div').html(msg);
	$('#submitnew  .msg').fadeIn(500,function(){	$('div#submitnew .loading').hide();});

	setTimeout(function(){
		$('#submitnew  .msg').fadeOut(500);
	},3000);


}

function displayErrorMsg(err){


	$('#submitnew .error div').html(err);
	$('#submitnew  .error').fadeIn(500,function(){$('div#submitnew .loading').hide();});

	setTimeout(function(){
		$('#submitnew  .error').fadeOut(500);
	},5000);


}

/*
function paddingforMediumScreen(){
	var height = document.body.clientHeight;
	var padding_bar = document.getElementById('padding-bar')
	alert(height);
	padding_bar.style.height = height

}
*/


function getAllNotifications(){

	var engage = new coreApi.Engage();
	setTimeout(getAllNotifications,10000);

	engage.getNotifications(function(data){
		$('#notification .notification_number').html(0);
		$('#notification_mobile .notification_number').html(0);
		console.log(data);
		$('#notification ul').html('<li class="center">You have no new notifications</li>');
		$('#mobile_notif ul').html('<li class="center">You have no new notifications</li>')
		if (data && data.errorcode == 0)
		{
//			$('#notification ul').empty();
			if (data.notifications && data.notifications.length > 0){
				$('#notification .notification_number').html(data.notifications.length);
				$('#notification_mobile .notification_number').html(data.notifications.length);

				$('#notification ul').empty();
				$('#mobile_notif ul').empty();
				$(data.notifications).each(function(i,notification){

					console.log(notification);
					$('#notification ul').append(renderNotificationBox(notification));
					$('#mobile_notif ul').append(renderNotificationBox(notification));

				})
			}
			else{
				$('#notification ul').html('<li class="center">You have no new notifications</li>');
				$('#mobile_notif ul').html('<li class="center">You have no new notifications</li>')
			}
		}
	})

}
