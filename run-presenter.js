var fs = require('fs');
var config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
var app = require(__dirname + '/app-presenter.js');

// listening
app.listen(process.env.DEPLOY_PORT || config.presenterServer.port, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});