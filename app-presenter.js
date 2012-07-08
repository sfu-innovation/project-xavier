var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesPresenter = require('./routes/rqra/routesPresenter.js');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json'));

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

// user
app.get('/api/user/:id', routesCommon.user); // get user by id

// course
app.get('/api/course/:id', routesCommon.course); // get course by id

// notification

// questions
app.get("/api/questions", routesPresenter.questions); // get all questions
app.get("/api/question/:uid", routesPresenter.question); // get question by id
app.put("/api/question/:uid", routesPresenter.question); // update question by id
app.delete("/api/question/:uid", routesPresenter.question); // update question by id
app.get("/api/user/:uid/questions", routesPresenter.questionsByUser); // get all questions for a user
app.post("/api/user/:uid/questions", routesPresenter.questionsByUser); // user posts a new question
app.put("/api/question/:uid/follow/:follower", routesPresenter.followQuestion); // a follower follows a question
app.put("/api/question/:uid/status", routesPresenter.questionStatus); // updates a questions status
app.post("/api/search/", routesPresenter.search); // search based on a query

// comments
app.get("/api/comments", routesPresenter.comments); // get all comments
app.get("/api/comment/:uid", routesPresenter.comment); // get a comment by id
app.put("/api/comment/:uid", routesPresenter.comment); // updates a question by id
app.delete("/api/comment/:uid", routesPresenter.comment); //deletes a comment by id
app.get("/api/user/:uid/comments", routesPresenter.commentsByUser); // gets a list of comments posted by a user
app.post("/api/user/:uid/comments", routesPresenter.commentsByUser); // user posts a comment
app.post("/api/comment/:uid/vote/:dir", routesPresenter.commentVote); // votes on a comment
app.put("/api/comment/:uid/answered", routesPresenter.commentAnswered); // updates a comments status to answered
app.get("/api/question/:uid/comments", routesPresenter.commentsByQuestion); // get all of the comments for a question


// listening
//app.listen(process.env.DEPLOY_PORT || config.presenterServer.port, function(){
//	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
//});