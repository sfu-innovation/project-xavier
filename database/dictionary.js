var 
	fs = require('fs'),
	config = JSON.parse(fs.readFileSync('config.json')),
	client = require('redis').createClient(config.dictionaryDB.port, config.dictionaryDB.host),
	natural = require('natural'),
	EventEmitter = require('events').EventEmitter;


var dictionary = function(){};

/***
 *	Pull all words from database into an array for use.
 **/
dictionary.prototype.words = function(callback) {
	var data = [], key = '*';
	
	client.select(config.dictionaryDB["db-num"], function(err, result) {
		if (err) {
			console.log(err);
			client.end();
		}
	})

	client.keys(key, function(err, result) {
		if (err) {	
			console.log(err);
			client.end();
		}

		//console.log(result);
		if (result.length === 0) {
			console.log("DB is empty.");
			client.end();
		}

		var i, 
			remaining = result.length;

		for (i in result) {
			getWords(result[i]);

		}

		client.on('added', function() {
			if (--remaining === 0) {
				client.end();
				callback(data);
			}
		})	
	})


	/***
	 *	add a word to dictionary, emmited from getWords function
	 ***/
	client.on('word', function(word, type) {
		data.push(word)
	})

	/***
	 *	wrapper used to ensure proper indexing
	 ***/
	function getWords (type){
		client.zrevrangebyscore(type, '+inf', '-inf', function(err, words){
			if (err) {
				console.log(err);
			}

			words.forEach(function(word) {
				client.emit('word', word, type);
			})
			client.emit('added');
		})
	}
}

/***
 *	Get distance from query word to dictionary word.
 *	Return array of all potential matches
 ***/
dictionary.prototype.testing = function(w, data) {

	var i,
		distance = 0.0,
		candidates = [],
		candidate;

	for(i in data) {
		candidate = data[i]
		distance = natural.JaroWinklerDistance(w, candidate);
		if (distance >= 0.8){
			candidates.push([distance, candidate])
		}
	}
	return candidates;
}

module.exports = new dictionary;
