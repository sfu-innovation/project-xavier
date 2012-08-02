var esQuery = require('./es-query');

esQuery('database/accent-es-data.json', function(result){
	console.log(result);
});