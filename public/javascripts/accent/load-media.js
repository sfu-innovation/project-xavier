var accent = new coreApi.Accent();

var mediaID = $('#mediaUUID').text().replace(/^\s+|\s+$/g, '');

function loadMedia(uuid){
	accent.getMediaFileById(uuid, function(data){
		$('#mediaPlayer').attr('src', data.mediafile.path);
		$('#mediaPlayer').attr('autoplay', 'autoplay');
	})
}

function playVideo(){
	$('#mediaPlayer').get(0).play();
	console.log("PLAY");
}

function formatTagTypeOption(index){
	var tagType = ["Question","Description"];
	return "<option value='" + index + "'>" + tagType[index] + "</option>";
}


function loadTagTypes() {
	var tagType = $("#tagType");
	
	for(var i = 0; i <= 1; ++i) {
		tagType.append(formatTagTypeOption(i));
	}
}

// start and end has to be matching with the UI timeline
// probabaly adding some offset value
function formatTimeline(tag){
	return "<div class='Tag' style='left: " + (tag.start + 40) + "px; width: " + (tag.end  + 60) + "px; background: " + "purple" + ";' " + "onclick='return selectedTag(this);' " + "UUID='" + tag.uuid + "'>"			
}

function loadTags(uuid) {
	var tagger = $(".Tagger").children(".Timeline");
	

	console.log('tagger')
	console.log(tagger);
	
	accent.getTagsByMediaFileId(uuid, function(data){
		console.log('tags:')
		console.log(data);

		data.tags.forEach(function(tag) {	
			console.log('tag')
			console.log(tag);
			tagger.append(formatTimeline(tag));
		});			
	});

	loadTagTypes();
}

loadMedia(mediaID);
loadTags(mediaID)
