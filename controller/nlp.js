
var dict = require('../database/dictionary.js'),
	natural = require('natural'),
	tokenizer = new natural.WordTokenizer(),
	EventEmitter = require('events').EventEmitter;

natural.PorterStemmer.attach();

var words = []
	,emitter = new EventEmitter();
/***
 *	Fill new array with words from database,
 *	emit "ready" event when done.
 ***/
dict.words(function(data) {
	Array.prototype.push.apply(words,data);
	emitter.emit("ready", words);
})

/***
 *	Check if dictionary array already filled.
 *	If not, fill dictionary.
 ***/
var w = function(callback) {
	if (words.length > 0) {
		callback(words);
	} else {
		emitter.on("ready", callback);
	}
}

var nlpQuery = module.exports = function(query, callback){
	/***
	 *	Tokenize query, check each word against
	 *	dictionary to get array of possible matches.
	 +	Single out most likely match and tokenize + stem words.
	 ***/
	w(function(words) {
		var i,
			sent = "",
			tokens = tokenizer.tokenize(query);
		//tokens = query.tokenizeAndStem();

		console.log('tokenizing query function');
		for (i in tokens) {
			var candidates = dict.testing(tokens[i], words);
			console.log(candidates);
			//console.log(hi_find(candidates));
			sent += " "+hi_find(candidates);
			//console.log(candidates.sort()[candidates.length-1][1]);
		}
		var tmp = sent.tokenizeAndStem();
		console.log('sent: ' + sent);
		callback(tmp.join(' '));
	})

	/***
	 *	Used to find most likely match.
	 ***/
	function hi_find(set) {
		var i,
			candidate = "",
			max = 0;
		for (i in set) {
			if (set[i][0] > max) {
				max = set[i][0];
				candidate = set[i][1];
			}
		}
		return candidate;
	}
}