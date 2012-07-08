var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesEngage = require('./routes/engage/routesEngage.js');
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
app.put('/api/resource/:uid/follow/:follower', routesEngage.follow); // adds a follower to a question tag
app.delete('/api/resource/:uid/follow/:follower', routesEngage.follow); // removes a follower from a question tag

exports.server = app

// listening
app.listen(process.env.DEPLOY_PORT || config.engageServer.port, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});