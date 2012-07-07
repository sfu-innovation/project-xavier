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

app.get('/course/:id', routesCommon.course); // get course by id

// questions
app.get("/question/:appType/:uid", routesPresenter.question); // get question by id
app.put("/question/:appType/:uid", routesPresenter.question); // update question by id
app.delete("/question/:appType/:uid", routesPresenter.question); // update question by id
app.get("/user/:uid/:appType/questions", routesPresenter.questionsByUser); // get all questions for a user
app.post("/user/:uid/:appType/questions", routesPresenter.questionsByUser); // user posts a new question
app.put("/question/:appType/:uid/follow/:follower", routesPresenter.followQuestion); // a follower follows a question
app.put("/question/:appType/:uid/status", routesPresenter.questionStatus); // updates a questions status

// comments
app.get("/comment/:appType/:uid", routesPresenter.comment); // get a comment by id
app.put("/comment/:appType/:uid", routesPresenter.comment); // updates a question by id
app.delete("/comment/:appType/:uid", routesPresenter.comment); //deletes a comment by id
app.get("/user/:uid/:appType/comments", routesPresenter.commentsByUser); // gets a list of comments posted by a user
app.post("/user/:uid/:appType/comments", routesPresenter.commentsByUser); // user posts a comment
app.post("/comment/:appType/:uid/vote/:dir", routesPresenter.commentVote); // votes on a comment
app.put("/comment/:appType/:uid/answered", routesPresenter.commentAnswered); // updates a comments status to answered

exports.server = app

// listening
app.listen(process.env.DEPLOY_PORT || config.presenterServer.port, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});