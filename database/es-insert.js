var esQuery = require('./es-query');

esQuery('database/qs.json', function(result){
	console.log(result);
});