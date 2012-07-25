var es = require('com.izaakschroeder.elasticsearch'),
	db = es.connect('localhost'),
	async = require('async'),
	indice = ['presenter', 'accent', 'engage'];

var map = function(appType, callback){
	var path = "/" + appType;

	var data = {
		"mappings":{
			"questions": {
				"properties": {
					"body": {
						"type": "multi_field",
						"fields": {
							"body": {
								"type": "string"
							},
							"untouched": {
								"type": "string",
								"index": "not_analyzed"
							}
						}
					},
					"category": {
						"type": "string"
					},
					"status": {
						"type": "string"
					},
					"user": {
						"type": "string",
						"index": "not_analyzed"
					},
					"title": {
						"type": "multi_field",
						"fields": {
							"title": {
								"type": "string"
							},
							"untouched": {
								"type": "string",
								"index": "not_analyzed"
							}
						}
					},
					"created": {
						"type": "date",
						"format":"dateOptionalTime"
					},
					"timestamp": {
						"type": "date",
						"format":"dateOptionalTime"
					},
					"followup": {
						"type": "string",
						"index": "not_analyzed"
					},
					"isInstructor": {
						"type": "string"
					},
					"viewCount": {
						"type": "integer"
					},
					"commentCount": {
						"type": "integer"
					},
					"course": {
						"type": "string"
					},
					"week": {
						"type": "integer"
					}
				}
			},

			"comments": {
				"properties": {
					"body": {
						"type": "multi_field",
						"fields": {
							"body": {
								"type": "string"
							},
							"untouched": {
								"type": "string",
								"index": "not_analyzed"
							}
						}
					},
					"upvote": {
						"type": "integer"
					},
					"downvote": {
						"type": "integer"
					},
					"created": {
						"type": "date",
						"format":"dateOptionalTime"
					},
					"timestamp": {
						"type": "date",
						"format":"dateOptionalTime"
					},
					"user": {
						"type": "string"
					},	
					"target_uuid": {
						"type" : "string",
						"index": "not_analyzed"
					},
					"title": {
						"type": "multi_field",
						"fields": {
							"title": {
								"type": "string"
							},
							"untouched": {
								"type": "string",
								"index": "not_analyzed"
							}
						}
					},
					"objectType": {
						"type" : "string"
					},
					"commentParent": {
						"type": "string"
					}
				}
			}
		}
	}
	db.post(path, data, function(err, req, data){
		console.log('Mapping to: %s...... %s', appType, JSON.stringify(data));
		callback();
	})
};

module.exports = function(callback){
	async.forEach(indice, function(index, callback){
		map(index, callback);
	}, function(err){
		console.log('-Mapping complete-');
		console.log();
		callback();
	})
}

