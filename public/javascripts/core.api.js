var coreApi = {}
coreApi._construct = function () {

	function Common(){

		this.getUserById = function(id,callback ){
			console.log("API - getUserById");
			$.ajax({
				url:'/api/user/' + id,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});

		}



		this.getCourseById = function(id,callback ){
			console.log("API - getCourseById");
			$.ajax({
				url:'/api/course/' + id,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});

		}
		
		// gets a list of courses for the current logged in user
		this.getUserCourses = function(id,callback ) {
			console.log("API - getUserCourses");
			$.ajax({
				url:'/api/user/courses',
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});
		}

		this.getUserProfileById = function(id,callback){
			console.log("API - getUserProfileById");
			$.ajax({
				url:'/api/user/' + id+'/profile',
				type:'GET',
				success:function (data) {
					callback(data);
				}
			})
		}

		this.updateUserProfileById = function(id, user_profile,callback){
			console.log("API - updateUserProfileById");
			$.ajax({
				url:'/api/user/' + id+'/profile',
				type:'PUT',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(user_profile),
				success:function (data) {
					callback(data);
				}
			})
		}



	}

	function Accent() {
		this.createTag = function(tag,callback){
			console.log('API - createTag');
			$.ajax({
				url:'/api/tag',
				type:'POST',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(tag),
				success:function (data) {
					callback(data);
				}
			})

		}

		this.getTagById = function(id, callback){
			console.log('API - getTagById');
			$.ajax({
				url:'/api/tag/'+id,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			})


		}

		this.updateTagById = function(id, tag, callback){
			console.log('API - updateTagById');
			$.ajax({
				url:'/api/tag/'+id,
				type:'PUT',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(tag),
				success:function (data) {
					callback(data);
				}
			})

		}

		this.deleteTagById = function(id,callback){
			console.log('API - deleteTagById');
			$.ajax({
				url:'/api/tag/'+id,
				type:'DELETE',
				success:function (data) {
					callback(data);
				}
			})

		}

		this.createMediaFile = function(media_file,callback){

			console.log('API - createMediaFile');
			$.ajax({
				url:'/api/mediafile',
				type:'POST',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(media_file),
				success:function (data) {
					callback(data);
				}
			})
		}

		this.getMediaFileById = function(id,callback){
			console.log('API - getMediaFileById');
			$.ajax({
				url:'/api/mediafile/'+id,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			})
		}

		this.updateMediaFileById = function(id,media_file,callback){
			console.log('API - updateMediaFileById');
			$.ajax({
				url:'/api/mediafile/'+id,
				type:'PUT',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(media_file),
				success:function (data) {
					callback(data);
				}
			})
		}

		this.deleteMediaFileById = function(id,callback){
			console.log('API - deleteMediaFileById');
			$.ajax({
				url:'/api/mediafile/'+id,
				type:'DELETE',
				success:function (data) {
					callback(data);
				}
			})
		}

		this.getTagsByMediaFileId = function(id,callback){
			console.log('API - getTagsByMediaFileId');
			$.ajax({
				url:'/api/mediafile/'+id+'/tags',
				type:'GET',
				success:function (data) {
					callback(data);
				}
			})


		}

	}

	function Engage() {

		this.createResource = function (course_id,title,description,resource_type,file_type,url,callback){
			console.log('API - createResource');
			var body = {};
			var resource = {};
			resource.course = course_id;
			resource.title = title;
			resource.description = description;
			resource.resourceType = resource_type;
			resource.fileType = file_type;
			resource.url = url;

			$.ajax({

				url:'/api/resource',
				type:'POST',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(body),
				success:function (data) {
					callback(data);

				}

			})

		}

		this.likeResource = function(resource_uuid,callback){
			console.log("API - likeResource");
			$.ajax({

				url:'/api/resource/'+ resource_uuid+'/like',
				type:'POST',
				success:function (data) {
					callback(data);

				}

			})

		}

		this.dislikeResource = function(resource_uuid,callback){
			console.log("API - dislikeResource");
			$.ajax({

				url:'/api/resource/'+ resource_uuid+'/like',
				type:'DELETE',
				success:function (data) {
					callback(data);

				}

			})

		}


		this.starResource = function(resource_uuid,callback){
			console.log("API - starResource");
			$.ajax({

				url:'/api/resource/'+ resource_uuid+'/star',
				type:'POST',
				success:function (data) {
					callback(data);

				}

			})

		}

		this.unstarResource = function(resource_uuid,callback){
			console.log("API - unstarResource");
			$.ajax({

				url:'/api/resource/'+ resource_uuid+'/star',
				type:'DELETE',
				success:function (data) {
					callback(data);

				}

			})

		}

		this.getStarredResources = function(callback){
			console.log("API - getStarredResources");
			$.ajax({

				url:'/api/resources/starred',
				type:'GET',
				success:function (data) {
					callback(data);

				}

			})

		}

		this.getResourcesByCourseUUID = function(id,callback){
			console.log("API - getResourcesByCourseUUID");
			$.ajax({

				url:'/api/course/'+id+'/resources/',
				type:'GET',
				success:function (data) {
					callback(data);

				}

			})

		}

		this.getResourcesByCourseUUIDAndWeek = function(id, week, callback){
			console.log("API - getResourcesByCourseUUIDAndWeek");
			$.ajax({

				url:'/api/course/'+id+'/resources/week/'+week,
				type:'GET',
				success:function (data) {
					callback(data);

				}

			})
		}

		this.getResourcesByCourseUUIDs = function(callback){
			console.log("API - getResourcesByCourseUUIDs");
			$.ajax({

				url:'/api/resources/',
				type:'GET',
				success:function (data) {
					callback(data);

				}

			})

		}

		this.getResourcesByCourseUUIDsAndWeek = function(week, callback){
			console.log("API - getResourcesByCourseUUIDsAndWeek");
			$.ajax({

				url:'/api/resources/week/'+week,
				type:'GET',
				success:function (data) {
					callback(data);

				}

			})
		}

		this.getResourcesByCurrentUserId = function(callback){
			console.log("API - getResourcesByCurrentUserId");
			$.ajax({

				url:'/api/resources/my',
				type:'GET',
				success:function (data) {
					callback(data);

				}

			})


		}





	}

	function Presenter() {
		this.myname = "asdf";
		this.createQuestion = function (questionTitle, questionBody, callback) {
			console.log("API - createQuestion");

			var body = {};
			var question = {};

			question.body = questionBody;
			question.category = 'testcategory'; //TODO need replaced
			question.title = questionTitle;
			body.question = question;


			$.ajax({
				url:'/api/question',
				type:'POST',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(body),
				success:function (data) {
					callback(data);

				}

			})

		}

		this.getAllQuestions = function (page, callback) {
			console.log("API - getAllQuestions");
			$.ajax({
				url:'/api/questions/page/' + page,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});
		}
		
		this.getNewQuestions = function (page, callback) {
			console.log("API - getNewQuestions");
			$.ajax({
				url:'/api/questions/new/page/' + page,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});
		}
		
		this.getUnansweredQuestions = function (page, callback) {
			console.log("API - getUnansweredQuestions");
			$.ajax({
				url:'/api/questions/unanswered/page/' + page,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});
		}
		
		this.getQuestionById = function (id, callback) {
			console.log("API - getQuestionById");
			$.ajax({
				url:'/api/question/' + id,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});
		}

		this.updateQuestionById = function (id, questionTitle, questionBody, callback) {
			console.log("API - updateQuestionById");
			var body = {};
			body.title= questionTitle;
			body.body = questionBody;
			$.ajax({
				url:'/api/question/' + id,
				type:'PUT',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(body),
				success:function (data) {
					callback(data);
				}
			});
		}
		
		this.updateQuestionViews = function (id, callback) {
			console.log("API - updateQuestionViews");
			var body = {};
			$.ajax({
				url:'/api/questions/' + id + '/views/',
				type:'PUT',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(body),
				success:function (data) {
					callback(data);
				}
			});
		}


		this.deleteQuestionById = function (id, callback) {
			console.log("API - deleteQuestionById");
			$.ajax({
				url:'/api/question/' + id,
				type:'DELETE',
				success:function (data) {
					callback(data);
				}
			});
		}


		this.getQuestionsByUserId = function (user_id, callback) {
			console.log("API - getQuestionsByUserId");			
			$.ajax({
				url:'/api/user/' + user_id + '/questions/page/0',
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});
		}

		this.searchQuestion = function (query, callback) {
			console.log("API - searchQuestion");
			var body = {};
			body.query = query;
			$.ajax({
				url:'/api/search/',
				type:'POST',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(body),
				success:function (data) {
					callback(data);
				}
			})
		}

		this.searchSortedQuestions = function(searchQuery, searchType, courseName, weekNumber, page, callback) {
			console.log("API - searchSortedQuestions");
			var body = { "searchQuery": searchQuery, "searchType": searchType, "course": courseName, "week": weekNumber };
			console.log(body);
			$.ajax({
				url:'/api/questions/search/page/' + page,
				type:'POST',
				dataType:'json',
				contentType:'application/json',
				data:JSON.stringify(body),
				success:function(data) {
					callback(data);
				}
			});
		}

		this.getCommentsByQuestion = function(questionUUID, callback) {
			console.log("API - getCommentsByQuestion");
						
			$.ajax({
				url:'/api/question/' + questionUUID + '/comments/page/0',
				type:'GET',				
				contentType:'application/json',				
				success:function(data) {
					callback(data);
				}
			});
		}
		
	   //comments

		this.getCommentsByTargetId = function (target_id, page, callback){
			console.log("API - getCommentsByTargetId");
			$.ajax({
				url:'/api/question/'+target_id+'/comments/page/' + page,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});
		}

		this.followQuestionById = function (id, callback){
			console.log("API - followQuestionById");
			$.ajax({
				url:'/api/question/'+id+'/follow',
				type:'PUT',
				success:function (data) {
					callback(data);
				}
			});
		}

		this.unfollowQuestionById = function (id, callback){
			console.log("API - unfollowQuestionById");
			$.ajax({
				url:'/api/question/'+id+'/unfollow',
				type:'PUT',
				success:function (data) {
					callback(data);
				}
			});
		}

		//Comments



		this.getAllComments = function (callback) {
			console.log("API - getAllComments");
			$.ajax({
				url:'/api/comments',
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});
		}


		this.createComment = function (target_id, comment_body, callback) {
			console.log("API - createComment");

			var body = {};
			var comment = {};

			comment.body = comment_body;

			//TODO:need to fix this to dynamic input
			comment.objectType = 'question';

			comment.target_uuid = target_id;
			body.comment = comment;


			$.ajax({
				//url : '/api/user/'+user_id+'/comments',
				url:'/api/comment',
				type:'POST',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(body),
				success:function (data) {
					callback(data);

				}

			})

		}

		this.getCommentById = function (id, callback) {
			console.log("API - getCommentById");
			$.ajax({
				url:'/api/comment/' + id,
				type:'GET',
				success:function (data) {
					callback(data);
				}
			});
		}

		this.updateCommentById = function (id, commentTitle, commentBody, callback) {
			console.log("API - updateCommentById");
			var body = {};
			body.body = commentBody;
			$.ajax({
				url:'/api/comment/' + id,
				type:'PUT',
				dataType:'json',
				contentType:"application/json",
				data:JSON.stringify(body),
				success:function (data) {
					callback(data);
				}
			});
		}


		this.deleteCommentById = function (id, callback) {
			console.log("API - deleteCommentById");
			$.ajax({
				url:'/api/comment/' + id,
				type:'DELETE',
				success:function (data) {
					callback(data);
				}
			});
		}


		this.getCommentsByUserId = function (user_id, callback) {
			console.log("API - getCommentsByUserId");
			$.ajax({
				url:'/api/user/' + user_id + '/comments',
				type:'GET',
				success:function (data) {
					callback(data);

				}
			});
		}

		this.upVoteCommentById = function(id, callback){
			console.log('API - upVoteCommentById');
			var dir = 0;
			voteCommentById( id,dir, callback);
		}

		this.downVoteCommentById = function(id, callback){
			console.log('API - downVoteCommentById');
			var dir = 1;
			voteCommentById(id,dir, callback);

		}


		//private method

		var voteCommentById = function(id,dir,callback){

			$.ajax({
				url :'/api/comment/'+id+'/vote/'+dir,
				type: 'PUT',
				dataType:'json',
				contentType:"application/json",
					success: function(data){
					callback(data);
				}

			})

		}






	}

	this.Common = Common;
	this.Accent = Accent;
	this.Engage = Engage;
	this.Presenter = Presenter;
}

coreApi._construct();

//
//var xx = new coreApi.Presenter();
//xx.downVoteCommentById('qJfzggggguOicWWAjx7F05',function(data){
//	console.log(data);
//});

//
//xx.updateQuestionById('pJfzndwdadddQuOicWWAjx7F00', "i have no clue!!!" ,function(data){
//
//	console.log(data);
//
//});
