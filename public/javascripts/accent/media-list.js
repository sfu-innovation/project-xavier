var accent = new coreApi.Accent();

function getMedia(courseUUID){

	if(courseUUID === 'all'){
		var courseUUIDS = [];
		var courses = $('#Courses').children();
		for(var i = 0; i < courses.length; ++i){
			var uuid = courses[i].querySelector(".UUID").innerHTML;
			if(uuid){
				courseUUIDS.push(uuid);
			}
		}
		getMedia(courseUUIDS);
	}

	accent.getMediaFiles(courseUUID, function(response){
		$('#media-list').empty();
		var media = response.media;
		for(var i = 0; i < media.length; ++i){
			var mediaNode = "<div class=\"Item\">" + 
				"<img src=\"" + media[i].thumbnail + "\" alt=\"\"/>" +
				"<h1>" + media[i].title + "</h1>" + 
				"<h2>Week 5</h2>" + 
				"<p>" + media[i].description + "</p>" + 
				"</div>"

			$('#media-list').append(mediaNode);
		}
	})
}

getMedia();