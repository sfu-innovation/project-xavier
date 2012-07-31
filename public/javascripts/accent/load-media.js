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
	var tagType = $("#TagType");
	
	for(var i = 0; i <= 1; ++i) {
		tagType.append(formatTagTypeOption(i));
	}
}

function formatTagtype(value) {
	var color = "";
	if (value === 0)
		color = "green";
	else
		color = "purple";
	return color;

}

// start and end has to be matching with the UI timeline
// probabaly adding some offset value
function formatTimeline(tag){
	return "<div class='Tag' style='left: " + (tag.start + 40) + "px; width: " + (tag.end  + 60) + "px; background: " + formatTagtype(tag.type) + ";' " + "onclick='return selectedTag(this);' " + "UUID='" + tag.uuid + "'>"			
}

function loadTags(uuid) {
	var tagger = $(".Tagger").children(".Timeline");
	
	accent.getTagsByMediaFileId(uuid, function(data){

		data.tags.forEach(function(tag) {	
			tagger.append(formatTimeline(tag));
		});			
	});

	loadTagTypes();
}

function selectedTag(tag) {	
	var tagID = $(tag).attr('uuid');	
	
	accent.getTagById(tagID, function(data){
		alert(JSON.stringify(data.tag));
	});
	
}

loadMedia(mediaID);
loadTags(mediaID)
