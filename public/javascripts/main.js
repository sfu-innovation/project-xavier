//Just a test file to demo how to use core.api.js


$(document).ready(function () {

	if(window.location.toString().indexOf("localhost") ==-1){
		alert("WRONG!!! To use this page, you need run the app first then visit localhost:port/test.html");
	}


	$("#tabs").tabs();

	var rqra = new coreApi.Presenter();
	var engage = new coreApi.Engage();
	var accent = new coreApi.Accent();
	var common = new coreApi.Common();

	loadAllQuestions(rqra);
	loadAllComments(rqra);

	$("#getALLQuestions").click(function (event) {

		loadAllQuestions(rqra);

	});

	$("#getQuestionById").click(function (event) {
		var question_id = $('#question_id').val();
		if (question_id) {
			rqra.getQuestionById(question_id, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						$('#question_title').val(data.question.title);
						$('#question_body').val(data.question.body);
					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT BE EMPTY ID');
		}
	})

	$("#followQuestionById").click(function (event) {
		var question_id = $('#question_id').val();
		if (question_id) {
			rqra.followQuestionById(question_id, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						alert('OK OK, REFRESH');

					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT BE EMPTY ID');
		}
	})


	$("#unfollowQuestionById").click(function (event) {
		var question_id = $('#question_id').val();
		if (question_id) {
			rqra.unfollowQuestionById(question_id, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						alert('OK OK, REFRESH');

					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT BE EMPTY ID');
		}
	})

	$("#updateQuestionById").click(function (event) {
		var question_id = $('#question_id').val();
		var new_title = $('#question_title').val();
		var new_body = $('#question_body').val();
		if (question_id && new_title && new_body) {
			//rqra.updateQuestionById('pJfzndwdadddQuOicWWAjx7F00', "i have no clue!!!" ,function(data){
			rqra.updateQuestionById(question_id, new_title, new_body, function (data) {

				if (data) {

					if (data.errorcode === 0) {

						alert("COOL,REFRESH THE LIST");
					}
					else {
						alert(data.message);
					}

				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT HAVE EMPTY FILED');
		}
	})

	$('#deleteQuestionById').click(function () {
		var question_id = $('#question_id').val();
		if (question_id) {

			rqra.deleteQuestionById(question_id, function (data) {

				if (data) {

					if (data.errorcode === 0) {

						alert("COOL, REFRESH THE LIST");
					}
					else {
						alert(data.message);
					}

				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}


			})


		}

		else {
			alert('CANNOT HAVE EMPTY FILED');
		}
	})


	$('#upVoteCommentById').click(function () {
		var question_id = $('#comment_id').val();
		if (question_id) {

			rqra.upVoteCommentById(question_id, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						alert("COOL, REFRESH THE LIST");
					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT HAVE EMPTY FILED');
		}
	})

	$('#downVoteCommentById').click(function () {
		var question_id = $('#comment_id').val();
		if (question_id) {

			rqra.downVoteCommentById(question_id, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						alert("COOL, REFRESH THE LIST");
					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT HAVE EMPTY FILED');
		}
	})


	$('#search').click(function () {
		var query = $('#searchQuery').val();
		if (query) {

			rqra.searchQuestion(query, function (data) {

				if (data) {
					$('#search_results').empty();
					if (data.errorcode === 0) {
						$.each(data.questions, function (index, item) {

							var content = '<li class="questions_li">'
								+ '<p>' + item._id + '</p>'
								+ '<p>' + item._source.body + '</p>'
								+ '<p>' + item._source.category + '</p>'
								+ '<p>' + item._source.status + '</p>'
								+ '<p>' + item._source.timestamp + '</p>'
								+ '<p>' + item._source.title + '</p>'
								+ '<p>' + item._source.user + '</p>'
								+ '</li>';
							$('#search_results').append(content);
						});
					}
					else {
						alert(data.message);


					}

				}
				else {
					alert('CANNOT CONNECT TO DATABASE');


				}

			});


		}


	})

	$('#createQuestion').click(function (event) {
		var title = $('#new_question_title').val();
		var body = $('#new_question_body').val();
		if (title && body) {
			rqra.createQuestion(title, body, function (data) {
				if (data) {

					if (data.errorcode === 0) {
						alert('OK OK REFRESH NOW');
					}
					else{
						alert(data.message);
					}

				}

				else {
					alert('CANNOT CONNECT TO DATABASE');


				}

			})


		}

	})


	$('#getQuestionsByUserId').click(function (event) {
		var user_id = $("#question_user_id").val();
		if (user_id) {
			rqra.getQuestionsByUserId(user_id, function (data) {
				if (data) {


					$('#user_questions').empty();
					if (data.errorcode === 0 && data.questions.length > 0) {

						$.each(data.questions, function (index, item) {

							var content = '<li class="questions_li">'
								+ '<p>_id: ' + item._id + '</p>'
								+ '<p>title: ' + item._source.title + '</p>'
								+ '<p>body: ' + item._source.body + '</p>'
								+ '<p>category: ' + item._source.category + '</p>'
								+ '<p>status: ' + item._source.status + '</p>'
								+ '<p>timestamp: ' + item._source.timestamp + '</p>'
								+ '<p>user: ' + item._source.user + '</p>'
								+ '</li>';
							$('#user_questions').append(content);
						});
					}
					else {
						alert(data.message);
					}

				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			});
		}
		else {
			alert('CANNOT BE EMPTY FILED');
		}


	});

	//comments

	$("#getALLComments").click(function (event) {

		loadAllComments(rqra);

	});


	$('#createComment').click(function (event) {
		var target_id = $('#new_comment_target_id').val();
		var title = $('#new_comment_title').val();
		var body = $('#new_comment_body').val();
		if (target_id && title && body) {
			rqra.createComment(target_id, title, body, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						alert('OK OK REFRESH NOW');
					}

				}

				else {
					alert('CANNOT CONNECT TO DATABASE');


				}

			})


		}
		else {
			alert('CANNOT BE EMPTY FILED');
		}

	})


	$("#getCommentById").click(function (event) {
		var comment_id = $('#comment_id').val();
		if (comment_id) {
			rqra.getCommentById(comment_id, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						$('#comment_title').val(data.comment.title);
						$('#comment_body').val(data.comment.body);
					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT BE EMPTY ID');
		}
	})


	$("#updateCommentById").click(function (event) {
		var comment_id = $('#comment_id').val();
		var new_title = $('#comment_title').val();
		var new_body = $('#comment_body').val();
		if (comment_id && new_title && new_body) {
			//rqra.updateCommentById('pJfzndwdadddQuOicWWAjx7F00', "i have no clue!!!" ,function(data){
			rqra.updateCommentById(comment_id, new_title, new_body, function (data) {

				if (data) {

					if (data.errorcode === 0) {

						alert("COOL,REFRESH THE LIST");
					}
					else {
						alert(data.message);
					}

				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT HAVE EMPTY FILED');
		}
	})

	$('#deleteCommentById').click(function () {
		var comment_id = $('#comment_id').val();
		if (comment_id) {

			rqra.deleteCommentById(comment_id, function (data) {

				if (data) {

					if (data.errorcode === 0) {

						alert("COOL, REFRESH THE LIST");
					}
					else {
						alert(data.message);
					}

				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}


			})


		}

		else {
			alert('CANNOT HAVE EMPTY FILED');
		}
	});


	$('#getCommentsByUserId').click(function (event) {
		var user_id = $("#comment_user_id").val();
		if (user_id) {
			rqra.getCommentsByUserId(user_id, function (data) {
				if (data) {

					$('#user_comments').empty();
					if (data.errorcode === 0 && data.comments.length > 0) {

						$.each(data.comments, function (index, item) {

							var content = '<li class="comments_li">'
								+ '<p>_id: ' + item._id + '</p>'
								+ '<p>body: ' + item._source.body + '</p>'
								+ '<p>downvote: ' + item._source.downvote + '</p>'
								+ '<p>isAnswered: ' + item._source.isAnswered + '</p>'
								+ '<p>objectType: ' + item._source.objectType + '</p>'
								+ '<p>target_uuid: ' + item._source.target_uuid + '</p>'
								+ '<p>timestamp: ' + item._source.timestamp + '</p>'
								+ '<p>title: ' + item._source.title + '</p>'
								+ '<p>upvote: ' + item._source.upvote + '</p>'
								+ '<p>user: ' + item._source.user + '</p>'
								+ '</li>';

							$('#user_comments').append(content);
						});
					}
					else {
						alert(data.message);
					}

				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			});
		}
		else {
			alert('CANNOT BE EMPTY FILED');
		}


	});


	$('#getCommentsByTargetId').click(function () {
		var target_id = $('#question_id').val();
		if (target_id) {

			rqra.getCommentsByTargetId(target_id, function (data) {

				if (data) {

					if (data.errorcode === 0 && data.comments.length > 0) {


						$.each(data.comments, function (index, item) {

							var content = '<li class="comments_li">'
								+ '<p>_id: ' + item._id + '</p>'

								+ '<p>body: ' + item._source.body + '</p>'
								+ '<p>downvote: ' + item._source.downvote + '</p>'
								+ '<p>isAnswered: ' + item._source.isAnswered + '</p>'
								+ '<p>objectType: ' + item._source.objectType + '</p>'
								+ '<p>target_uuid: ' + item._source.target_uuid + '</p>'
								+ '<p>timestamp: ' + item._source.timestamp + '</p>'
								+ '<p>title: ' + item._source.title + '</p>'
								+ '<p>upvote: ' + item._source.upvote + '</p>'
								+ '<p>user: ' + item._source.user + '</p>'
								+ '</li>';
							$('#question_comments').append(content);
						});
					}
					else {
						alert(data.message);
					}

				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}


			})


		}

		else {
			alert('CANNOT HAVE EMPTY FILED');
		}
	});


///////////////////////////////////////////////USERS///////////////


	$("#getUserById").click(function (event) {
		var id = $('#user_uuid').val();
		if (id) {
			common.getUserById(id, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						$('#user_first_name').val(data.user.firstName);
						$('#user_last_name').val(data.user.lastName);
						$('#user_type').val(data.user.type);
						$('#user_prefered_name').val(data.user.preferedName);
						$('#user_user_id').val(data.user.userID);
						$('#user_email').val(data.user.email);
						$('#user_created').val(data.user.createdAt);
						$('#user_updated').val(data.user.updatedAt);
					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT BE EMPTY ID');
		}
	});

	$("#getCourseById").click(function (event) {
		var id = $('#course_uuid').val();
		if (id) {
			common.getCourseById(id, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						$('#course_title').val(data.course.title);
						$('#course_section').val(data.course.section);
						$('#course_subject').val(data.course.subject);
						$('#course_number').val(data.course.number);
						$('#course_instructor').val(data.course.instructor);
						$('#course_created').val(data.course.createdAt);
						$('#course_updated').val(data.course.updatedAt);
					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT BE EMPTY ID');
		}
	});

	///user profile

	$("#getUserProfileById").click(function (event) {
		var id = $('#userp_user').val();
		if (id) {
			common.getUserProfileById(id, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						$('#userp_bio').val(data.profile.bio);
						$('#userp_profile_picture').val(data.profile.profilePicture);
						$('#userp_last_watched_tag').val(data.profile.lastWatchedTag);
						$('#userp_created').val(data.profile.createdAt);
						$('#userp_updated').val(data.profile.updatedAt);


					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT BE EMPTY ID');
		}
	});


	$("#updateUserProfileById").click(function (event) {
		var id = $('#userp_user').val();

		var new_bio = $('#userp_bio').val();
		var new_profile_picture = $('#userp_profile_picture').val();

		var user_profile = {};
		user_profile.bio = new_bio;
		user_profile.profilePicture = new_profile_picture;

		if (id && new_bio && new_profile_picture) {
			common.updateUserProfileById(id, user_profile, function (data) {
				if (data) {
					if (data.errorcode === 0) {

						alert('OK OK REFRESH NOW');


					}
					else {
						alert(data.message);
					}
				}
				else {
					alert('CANNOT CONNECT TO DATABASE');
				}
			})
		}
		else {
			alert('CANNOT BE EMPTY ID');
		}
	});

	/////////////////////////////////////resource//////////////////////

	$('#createResource').click(function (event) {

		var course_id = $('#resource_course');
		var title = $('#resource_title');
		var description = $('#resource_description');
		var type = $('#resource_resource_type');
		var filetype = $('#resource_file_type');
		var url = $('#resource_url');

		if (course_id && title && description && type && filetype && url) {
			engage.createResource(course_id, title, description, type, filetype, url, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						alert('OK OK REFRESH NOW');
					}
					else {

						alert(data.message);

					}

				}

				else {
					alert('CANNOT CONNECT TO DATABASE');


				}

			})


		}
		else {
			alert('CANNOT BE EMPTY FILED');
		}

	})

	//tag


	$('#createTag').click(function (event) {

		var tag = {};

		tag.start = $('#tag_start').val();
		tag.end = $('#tag_end').val();
		tag.type = $('#tag_type').val();
		tag.target = $('#tag_target_uuid').val();
		tag.title = $('#tag_title').val();
		tag.description = $('#tag_description').val();
		tag.question = $('#tag_question').val();
		tag.important = $('#tag_important').val();
		tag.interest = $('#tag_interest').val();
		tag.examable = $('#tag_examable').val();
		tag.reviewlater = $('#tag_reviewlater').val();
		tag.shared = $('#tag_shared').val();

		if (tag.start && tag.description && tag.type && tag.target) {

			accent.createTag(tag, function (data) {
				if (data) {
					if (data.errorcode === 0) {
						alert('OK OK REFRESH NOW');
					}
					else {

						alert(data.message);

					}

				}

				else {
					alert('CANNOT CONNECT TO DATABASE');


				}

			})


		}
		else {
			alert('CANNOT BE EMPTY FILED');
		}

	})


});

function loadAllQuestions(rqra) {

	rqra.getAllQuestions(function (data) {
		if (data) {
			$('#questions').empty();
			if (data.errorcode === 0 && data.questions.length > 0) {

				$.each(data.questions, function (index, item) {

					var content = '<li class="questions_li">'
						+ '<p>_id: ' + item._id + '</p>'
						+ '<p>title: ' + item._source.title + '</p>'
						+ '<p>body: ' + item._source.body + '</p>'
						+ '<p>category: ' + item._source.category + '</p>'
						+ '<p>status: ' + item._source.status + '</p>'
						+ '<p>timestamp: ' + item._source.timestamp + '</p>'
						+ '<p>user: ' + item._source.user + '</p>'
						+ '<p>followers: ' + item._source.followup + '</p>'

						+ '</li>';
					$('#questions').append(content);
				});
			}
			else {
				alert(data.message);
			}

		}
		else {
			alert('CANNOT CONNECT TO DATABASE');
		}
	});

}


function loadAllComments(rqra) {

	rqra.getAllComments(function (data) {
		if (data) {
			$('#comments').empty();

			if (data.errorcode === 0 && data.comments.length > 0) {

				$.each(data.comments, function (index, item) {

					var content = '<li class="comments_li">'
						+ '<p>_id: ' + item._id + '</p>'

						+ '<p>body: ' + item._source.body + '</p>'
						+ '<p>downvote: ' + item._source.downvote + '</p>'
						+ '<p>isAnswered: ' + item._source.isAnswered + '</p>'
						+ '<p>objectType: ' + item._source.objectType + '</p>'
						+ '<p>target_uuid: ' + item._source.target_uuid + '</p>'
						+ '<p>timestamp: ' + item._source.timestamp + '</p>'
						+ '<p>title: ' + item._source.title + '</p>'
						+ '<p>upvote: ' + item._source.upvote + '</p>'
						+ '<p>user: ' + item._source.user + '</p>'
						+ '</li>';
					$('#comments').append(content);
				});
			}
			else {
				alert(data.message);
			}

		}
		else {
			alert('CANNOT CONNECT TO DATABASE');
		}
	});

}

