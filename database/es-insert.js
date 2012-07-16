var es = require('com.izaakschroeder.elasticsearch')
	,fs = require('fs')
	,db = es.connect('localhost')
	,esMapping = require('./es-mapping');

var importToEs = function(){
    fs.readFile('qs.json', function (err, data) {
		if (err) {
			throw err;
        }else {
            var json_data = JSON.parse(data);
            json_data.forEach(function(data) {
                data_index = data._index;
                data_mapping = data._type;
                data_id = data._id;
                data_source = data._source;

                index = db.index(data_index),
                mapping = index.mapping(data_mapping);
                mapping.document(data_id).set(data_source, function(err, req, data){
					console.log(data);
				});;
 			});
		}
	});
}

var deleteEs = function(){
	db.delete('', function(err, req, data){
		if(data){
			console.log('-Deleted ES Documents-');
			esMapping(importToEs);
		}
	});
}

deleteEs();