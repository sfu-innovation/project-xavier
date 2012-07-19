var accent = {}
accent._construct = function () {
		
	this.createTag = function(tag,callback){
		console.log('API - createTag');
		$.ajax({
			url:'/api/tag',
			type:'POST',
			dataType:'json',
			contentType:"application/json",
			data:JSON.stringify(tag),
			success:function (data) {
				callback(data);
			}
		})

	}

	this.getTagById = function(id, callback){
		console.log('API - getTagById');
		$.ajax({
			url:'/api/tag/'+id,
			type:'GET',
			success:function (data) {
				callback(data);
			}
		})


	}

	this.updateTagById = function(id, tag, callback){
		console.log('API - updateTagById');
		$.ajax({
			url:'/api/tag/'+id,
			type:'PUT',
			dataType:'json',
			contentType:"application/json",
			data:JSON.stringify(tag),
			success:function (data) {
				callback(data);
			}
		})

	}

	this.deleteTagById = function(id,callback){
		console.log('API - deleteTagById');
		$.ajax({
			url:'/api/tag/'+id,
			type:'DELETE',
			success:function (data) {
				callback(data);
			}
		})

	}

	this.createMediaFile = function(media_file,callback){

		console.log('API - createMediaFile');
		$.ajax({
			url:'/api/mediafile',
			type:'POST',
			dataType:'json',
			contentType:"application/json",
			data:JSON.stringify(media_file),
			success:function (data) {
				callback(data);
			}
		})
	}

	this.getMediaFileById = function(id,callback){
		console.log('API - getMediaFileById');
		$.ajax({
			url:'/api/mediafile/'+id,
			type:'GET',
			success:function (data) {
				callback(data);
			}
		})
	}

	this.updateMediaFileById = function(id,media_file,callback){
		console.log('API - updateMediaFileById');
		$.ajax({
			url:'/api/mediafile/'+id,
			type:'PUT',
			dataType:'json',
			contentType:"application/json",
			data:JSON.stringify(media_file),
			success:function (data) {
				callback(data);
			}
		})
	}

	this.deleteMediaFileById = function(id,callback){
		console.log('API - deleteMediaFileById');
		$.ajax({
			url:'/api/mediafile/'+id,
			type:'DELETE',
			success:function (data) {
				callback(data);
			}
		})
	}

	this.getTagsByMediaFileId = function(id,callback){
		console.log('API - getTagsByMediaFileId');
		$.ajax({
			url:'/api/mediafile/'+id+'/tags',
			type:'GET',
			success:function (data) {
				callback(data);
			}
		})


	}
	
}

accent._construct();

