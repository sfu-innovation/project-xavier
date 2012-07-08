var app = require(__dirname + '/app-accent.js');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));

// listening
app.listen(process.env.DEPLOY_PORT || config.accentServer.port, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});