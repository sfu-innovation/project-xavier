var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesPresenter = require('./routes/rqra/routesPresenter.js');

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
app.get('/login', routesCommon.login);
app.get('/demo', routesPresenter.demo);

// user
app.get('/api/user/:id', routesCommon.user); // get user by id
app.post('/api/users/', routesCommon.userQuery); // get a list of users based on a custom query
app.put('/api/user/setPreferedName', routesCommon.userPreferredName); // update users prefered name

app.get('/api/course/:id/members', routesCommon.courseMembers);

// course
app.get('/api/course/:id', routesCommon.course); // get course by id
app.post('/api/course/', routesCommon.courseQuery); // get a list of courses based on a custom query

// notification

// questions

//TODO: need update this into document
app.post("/api/question", routesPresenter.question); // post a new question by user id stored in seesion


//TODO: need update this into document
app.get("/api/questions", routesPresenter.questions); // get all questions
app.get("/api/questions/unanswered", routesPresenter.questionsUnanswered); // get all unanswered questions
app.get("/api/questions/new", routesPresenter.questionsNew); //get all new questions
app.get("/api/questions/answered", routesPresenter.questionsAnswered)

app.get("/api/question/:uid", routesPresenter.question); // get question by id
app.put("/api/question/:uid", routesPresenter.question); // update question by id
app.delete("/api/question/:uid", routesPresenter.question); // update question by id
app.get("/api/user/:uid/questions", routesPresenter.questionsByUser); // get all questions for a user

//deprecated, we do not need :uid when user post a new question
//app.post("/api/user/:uid/questions", routesPresenter.questionsByUser); // user posts a new question

//TODO: need update this into document
app.put("/api/question/:uid/follow", routesPresenter.followQuestion); // a follower follows a question
//TODO: need update this into document
app.put("/api/question/:uid/unfollow", routesPresenter.unfollowQuestion); // a follower follows a question

//TODO: this going to be deprecated, becuase we do not need ":follower"
//app.put("/api/question/:uid/follow/:follower", routesPresenter.followQuestion); // a follower follows a question

app.put("/api/question/:uid/status", routesPresenter.questionStatus); // updates a questions status
app.post("/api/search/", routesPresenter.search); // search based on a query



// comments

//TODO: need update this into document
app.post("/api/comment",routesPresenter.comment); // post a new comment by user id stored in seesion object

app.get("/api/comments", routesPresenter.comments); // get all comments

app.get("/api/comment/:uid", routesPresenter.comment); // get a comment by id
app.put("/api/comment/:uid", routesPresenter.comment); // updates a question by id
app.delete("/api/comment/:uid", routesPresenter.comment); //deletes a comment by id
app.get("/api/user/:uid/comments", routesPresenter.commentsByUser); // gets a list of comments posted by a user

//deprecated
//app.post("/api/user/:uid/comments", routesPresenter.commentsByUser); // user posts a comment
app.post("/api/comment/:uid/vote/:dir", routesPresenter.commentVote); // votes on a comment
app.put("/api/comment/:uid/answered", routesPresenter.commentAnswered); // updates a comments status to answered
app.get("/api/question/:uid/comments", routesPresenter.commentsByQuestion); // get all of the comments for a question



//userprofile

app.get("/api/user/:id/profile",routesCommon.userProfile); //get user profile by id
app.put("/api/user/:id/profile",routesCommon.userProfile); //update user profile by id

