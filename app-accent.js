var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesAccent = require('./routes/accent/routesAccent.js');
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

// follower
app.put('/api/question/:uid/follow/:follower', routesAccent.follow); // adds a follower to a question tag
app.delete('/api/question/:uid/follow/:follower', routesAccent.follow); // removes a follower from a question tag

// questions
app.get("/api/question/:uid", routesAccent.question); // get question by id
app.put("/api/question/:uid", routesAccent.question); // update question by id
app.delete("/api/question/:uid", routesAccent.question); // update question by id
app.get("/api/user/:uid/questions", routesAccent.questionsByUser); // get all questions for a user
app.post("/api/user/:uid/questions", routesAccent.questionsByUser); // user posts a new question
app.put("/api/question/:uid/follow/:follower", routesAccent.followQuestion); // a follower follows a question
app.put("/api/question/:uid/status", routesAccent.questionStatus); // updates a questions status

// comments
app.get("/api/comment/:uid", routesAccent.comment); // get a comment by id
app.put("/api/comment/:uid", routesAccent.comment); // updates a question by id
app.delete("/api/comment/:uid", routesAccent.comment); //deletes a comment by id
app.get("/api/user/:uid/comments", routesAccent.commentsByUser); // gets a list of comments posted by a user
app.post("/api/user/:uid/comments", routesAccent.commentsByUser); // user posts a comment
app.post("/api/comment/:uid/vote/:dir", routesAccent.commentVote); // votes on a comment
app.put("/api/comment/:uid/answered", routesAccent.commentAnswered); // updates a comments status to answered

exports.server = app

// listening
app.listen(process.env.DEPLOY_PORT || config.accentServer.port, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});