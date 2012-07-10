var nlp = require('../../../controller/nlp.js');

nlp('this is a sentence test', function(result){
	console.log(result);
})