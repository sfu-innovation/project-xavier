var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesAccent = require('./routes/accent/routesAccent.js');
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

// question
//app.get("/question/:id", routes.question); // get question by id
//app.put("/question/:id", routes.question); // update question by id
//app.delete("/question/:id", routes.question); // update question by id

exports.server = app

// listening
app.listen(process.env.DEPLOY_PORT || config.accentServer.port, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});