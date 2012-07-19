process.setMaxListeners(0);//annoying.
var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesRqra = require('./routes/rqra/routesRqra.js');

var app = module.exports = express.createServer();

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({ secret: "keyboard cat",
			store: express.session.MemoryStore({ reapInterval: 60000 })
		}));
	//app.use(express.csrf());
	app.use(app.router);
	app.use(express.static(__dirname + "/public"));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

app.dynamicHelpers({
	token: function(request, response) {
		return request.session._csrf;
	}
});

// routing
app.get('/', routesCommon.index);
app.get('/login', routesRqra.login);
app.get('/logout', routesCommon.logout);

// main views
app.get('/questions', routesRqra.questionListPage);

// components
app.get('/component/header', routesRqra.header);
app.get('/component/courses', routesRqra.courseList);
app.get('/component/timeline', routesRqra.timeline);
app.get('/component/questions', routesRqra.questionList);
app.get('/component/question', routesRqra.questionDetails);
app.get('/component/new', routesRqra.questionForm);
app.get('/component/notification', routesRqra.notificationList);

// user
app.get('/api/user/courses', routesCommon.userCourses); // gets a list of all the users courses
app.get('/api/user/:id', routesCommon.user); // get user by id
app.post('/api/users/', routesCommon.userQuery); // get a list of users based on a custom query
app.put('/api/user/setPreferedName', routesCommon.userPreferredName); // update users prefered name

app.get('/api/course/:id/members', routesCommon.courseMembers);

// course
app.get('/api/course/:id', routesCommon.course); // get course by id
app.post('/api/courses/', routesCommon.courseQuery); // get a list of courses based on a custom query
app.get('/api/course/:id/instructor', routesCommon.courseInstructor); // get the instructor of a course

// notification

// questions

//TODO: need update this into document
app.post("/api/question", routesRqra.question); // post a new question by user id stored in seesion


//TODO: need update this into document
app.put("/api/questions/view/:uid", routesRqra.questionViewCount); // increase view count
app.get("/api/questions/instructor/page/:page", routesRqra.instructorQuestions);	//get all instructor questions
app.get("/api/questions/page/:page", routesRqra.questions); //P, get all questions
app.get("/api/questions/unanswered/page/:page", routesRqra.questionsUnanswered); //P, get all unanswered questions
app.get("/api/questions/new/page/:page", routesRqra.questionsNew); //P get all new questions
app.get("/api/questions/answered/page/:page", routesRqra.questionsAnswered); //P

app.get("/api/question/:uid", routesRqra.question); // get question by id
app.put("/api/question/:uid", routesRqra.question); // update question by id
app.delete("/api/question/:uid", routesRqra.question); // update question by id
app.get("/api/user/:uid/questions/page/:page", routesRqra.questionsByUser); // P, get all questions for a user. TODO:sort desc

//deprecated, we do not need :uid when user post a new question
//app.post("/api/user/:uid/questions", routesRqra.questionsByUser); // user posts a new question

//TODO: need update this into document
app.put("/api/question/:uid/follow", routesRqra.followQuestion); // a follower follows a question
//TODO: need update this into document
app.put("/api/question/:uid/unfollow", routesRqra.unfollowQuestion); // a follower follows a question

//TODO: this going to be deprecated, becuase we do not need ":follower"
//app.put("/api/question/:uid/follow/:follower", routesRqra.followQuestion); // a follower follows a question

app.put("/api/question/:uid/status", routesRqra.questionStatus); // updates a questions status
app.post("/api/search/page/:page", routesRqra.search); // search based on a query



// comments

//TODO: need update this into document
app.post("/api/comment",routesRqra.comment); // post a new comment by user id stored in seesion object

app.get("/api/comments/page/:page", routesRqra.comments); //P get all comments
app.get("/api/comment/count/:uid", routesRqra.commentCount);
app.get("/api/comment/:uid", routesRqra.comment); // get a comment by id
app.put("/api/comment/:uid", routesRqra.comment); // updates a question by id
app.delete("/api/comment/:uid", routesRqra.comment); //deletes a comment by id
app.get("/api/user/:uid/comments/:page", routesRqra.commentsByUser); //P gets a list of comments posted by a user

//deprecated
//app.post("/api/user/:uid/comments", routesRqra.commentsByUser); // user posts a comment
app.put("/api/comment/:uid/vote/:dir", routesRqra.commentVote); // votes on a comment
app.put("/api/comment/:uid/answered", routesRqra.commentAnswered); // updates a comments status to answered
app.get("/api/question/:uid/comments/:page", routesRqra.commentsByQuestion); // P get all of the comments for a question



//userprofile

app.get("/api/user/:id/profile",routesCommon.userProfile); //get user profile by id
app.put("/api/user/:id/profile",routesCommon.userProfile); //update user profile by id

/***NEW ROUTES */
app.post("/api/questions/search/page/:page", routesRqra.searchQuestions);