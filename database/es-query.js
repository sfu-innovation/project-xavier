var es = require('com.izaakschroeder.elasticsearch')
	,fs = require('fs')
	,db = es.connect('localhost')
	,esMapping = require('./es-mapping')
	,async = require('async');

var importToEs = function(fileName, callback){
    fs.readFile(fileName, function (err, data) {
		if (err) {
			throw err;
        }else {
            var json_data = JSON.parse(data);

			async.forEach(json_data, function(data, done){
				data_index   = data._index;
				data_mapping = data._type;
				data_id      = data._id;
				data_source  = data._source;

				index   = db.index(data_index),
				mapping = index.mapping(data_mapping);
				mapping.document(data_id).set(data_source, function(err, req, data){
					done();
				});
			}, function(err){
				if(err){throw err;}

				callback("Done inserting everything");
			})


		}
	});
}

module.exports = deleteEs = function(fileName, callback){
	db.delete('', function(err, req, data){
		if(data){
			console.log('-Deleted ES Documents-');
			esMapping(importToEs.bind(undefined, fileName, callback));
		}
	});
}