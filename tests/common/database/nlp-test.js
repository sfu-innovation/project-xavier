var nlp = require('../../../controller/nlp.js');

nlp('word', function(result){
	console.log("result: " +result);
});

nlp('dddd', function(result){
	console.log("result: " + result);
});