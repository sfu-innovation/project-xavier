var	fs = require('fs'),
	config = JSON.parse(fs.readFileSync('config.json')),
	text = fs.readFileSync('database/brown_nostem.txt').toString().split('\n'),
	client = require('redis').createClient(config.dictionaryDB.port, config.dictionaryDB.host),
	EventEmitter = require('events').EventEmitter;

var data = [];
var count = text.length;
for(i in text) {
	data.push(text[i]);
}

client.select(config.dictionaryDB["db-num"], function(err, result) {
	if(err) {
		console.log(err);
		client.end();
	}
})

for(i in data) {
	var line = data[i].split(' ');

	client.zadd('dict', parseFloat(line[1]), line[0], function(err, result) {
		if (err) {
			console.log(err);
		}
		client.emit('add');
	})
}

client.on('add', function() {
	if (--count === 0) {
		console.log('total: ' + text.length);
		client.end();
	}
})