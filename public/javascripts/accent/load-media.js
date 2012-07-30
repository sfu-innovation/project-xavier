var accent = new coreApi.Accent();

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


function loadTagType() {
	var tagType = $("#tagType");
	
	for(var i = 0; i <= 1; ++i) {
		tagType.append(formatTagTypeOption(i));
	}
	console.log('tag type');
	console.log(tagType)
}

loadMedia($('#mediaUUID').text());
loadTagType();