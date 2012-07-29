var accent = new coreApi.Accent();

function getMedia(courseUUID){

	if(courseUUID === 'all'){
		var courseUUIDS = [];
		var courses = $('#Courses').children();
		for(var i = 0; i < courses.length; ++i){
			var uuid = courses[i].querySelector(".UUID");
			if(uuid){
				courseUUIDS.push(uuid.innerHTML);
			}
		}
		getMedia(courseUUIDS);
	}

	accent.getMediaFiles(courseUUID, function(response){
		$('#media-list').empty();
		var media = response.media;
		for(var i = 0; i < media.length; ++i){

			(function(mediaItem){
				accent.getMediaSection(mediaItem.uuid, function(section){
				var mediaNode = "<div class=\"MediaItem\">" + 
					"<img src=\"" + mediaItem.thumbnail + "\" alt=\"\" width=\"200\"/>" +
					"<h1>" + mediaItem.title + "</h1>" + 
					"<h2>" + section.section + "</h2>" + 
					"<p>" + mediaItem.description + "</p>" + 
					"</div>"

				$('#media-list').append(mediaNode);
				})
			})(media[i])
		}
	})
}

getMedia();