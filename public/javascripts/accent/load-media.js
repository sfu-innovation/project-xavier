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

function loadTags(uuid) {
	var tagger = $(".Tagger").children(".Timeline");
	

	console.log('tagger')
	console.log(tagger);
	
	accent.getTagsByMediaFileId(uuid, function(data){
		console.log('tags:')
		console.log(data);
	
	});

	loadTagTypes();
}

loadMedia(mediaID);
loadTags(mediaID)
