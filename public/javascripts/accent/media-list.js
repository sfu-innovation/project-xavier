var accent = new coreApi.Accent();
var common = new coreApi.Common();

function getMedia(courseUUID, all){
	// Only load media files if on the main page
	if($('#media-list')){
		//alert("UUID " + courseUUID);
		// If the all button was clicked, build up an array of course uuids
		// to feed to getMedia
		if(typeof courseUUID === 'string' && courseUUID.toLowerCase() === 'all'){
			var courseUUIDS = [];
			var courses = $('#Courses').children();
			for(var i = 0; i < courses.length; ++i){
				var uuid = courses[i].querySelector(".UUID");
				if(uuid){
					courseUUIDS.push(uuid.innerHTML.replace(/\t/g, ''));
				}
			}
			retrieveMedia(courseUUIDS, true);
		}
		else{
			retrieveMedia(courseUUID, false);
		}
	}
}

function formatMediaList() {
	return  "<div id='Main'>"
			+ "<h1> Here are the videos you should watch! </h1>"
			+ "<div id='media-list'></div>"
			+ "</div>";
}

function returnColor(uuid) {
	var color = "", done = false;
	var courseNumbers = $('#Courses li a span.UUID');
	courseNumbers.each(function() {
		var courseID = $(this).text().trim();

		if (courseID === uuid) {
			var course = $(this).parent().parent();

			if (!done) {
				color = course.css("border-bottom-color");
				done = true;
			}
		}									
	})
	return color;
}

var retrieveMedia = function(courseUUID, all){
	console.log(courseUUID);
	var mainContent = $("#Main").children("#media-list");

	if (mainContent.size() === 0) {		
		var mediaList = formatMediaList();
		$("#Main").replaceWith(mediaList);
	}

	accent.getMediaFiles(courseUUID, function(response){
		$('#media-list').empty();
		var media = response.media;
		for(var i = 0; i < media.length; ++i){

			(function(mediaItem){
				accent.getMediaSection(mediaItem.uuid, function(section){
					var mediaNode = "<div class=\"MediaItem\">" + 
						"<div class='MediaImage'><a href=\"/video/" + mediaItem.uuid + "\">" + 
						"<img src='/media/" + mediaItem.thumbnail + "' alt=\"\" />" +
						"</a></div>" + 
						"<div class='MediaInfo'>" + "<a href=\"/video/" + mediaItem.uuid + "\" class='VideoTitle'>" + "<h1>" + mediaItem.title + "</h1></a>";
					if($('#EditForm').length > 0){
						mediaNode = mediaNode + "<a onclick='return editLinks(\"" + mediaItem.uuid + "\",\"" + mediaItem.title + "\",\"" + mediaItem.description + "\");' class='EditLink' >Edit</a>";
					}

					mediaNode = mediaNode + "<p class='VideoDescription'>" + mediaItem.description + "</p></div>";
					
					// If getting media for all courses, also get the course 
					// name/number of the media file
					if(all){
						(function(courseUUID){
							common.getCourseById(courseUUID, function(response){
								var courseName = response.course.subject + " " + response.course.number;
								var color =  returnColor(response.course.uuid);
								mediaNode = mediaNode + 
								"<div class='Section' style='background:"+ color +"'><h2><b>" + response.course.subject + " " +
								response.course.number + "</b></h2>" +
								"</div></div></div>";
								$('#media-list').append(mediaNode);
							})
						})(mediaItem.course);
					}
					else{
						mediaNode = mediaNode +
						"<div class='Section'><h2><b>" + section.section + "</b></h2></div></div></div>";
						$('#media-list').append(mediaNode);
					}
				})
			})(media[i])
		}
	})
}

function editLinks(mediaUUID, mediaTitle, mediaDescription){
	$('#EditForm').css('display','block');
	$('#EditFormAction').attr('action','/mediafile/'+mediaUUID+'/update');
	$('.EditTitle').val(mediaTitle);
	$('.EditDescription').val(mediaDescription);
	return false;
}

getMedia($('.Selected').text());