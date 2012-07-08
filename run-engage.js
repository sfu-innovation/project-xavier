var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json'));
var app = require(__dirname + '/app-engage.js');

// listening
app.listen(process.env.DEPLOY_PORT || config.engageServer.port, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});