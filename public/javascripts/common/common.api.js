var common = {}
common._construct = function () {

	this.getUserById = function(id,callback ){
		console.log("API - getUserById");
		$.ajax({
			url:'/api/user/' + id,
			type:'GET',
			success:function (data) {
				callback(data);
			}
		});

	}



	this.getCourseById = function(id,callback ){
		console.log("API - getCourseById");
		$.ajax({
			url:'/api/course/' + id,
			type:'GET',
			success:function (data) {
				callback(data);
			}
		});

	}

	this.getUserProfileById = function(id,callback){
		console.log("API - getUserProfileById");
		$.ajax({
			url:'/api/user/' + id+'/profile',
			type:'GET',
			success:function (data) {
				callback(data);
			}
		})
	}

	this.updateUserProfileById = function(id, user_profile,callback){
		console.log("API - updateUserProfileById");
		$.ajax({
			url:'/api/user/' + id+'/profile',
			type:'PUT',
			dataType:'json',
			contentType:"application/json",
			data:JSON.stringify(user_profile),
			success:function (data) {
				callback(data);
			}
		})
	}	
}

common._construct();
