var accent = new coreApi.Accent();

var mediaID = $('#mediaUUID').text().replace(/^\s+|\s+$/g, '');

function loadMedia(uuid){
	accent.getMediaFileById(uuid, function(data){
		$('#mediaPlayer').attr('src', '/media/' + data.mediafile.path);
		$('#mediaPlayer').attr('autoplay', 'autoplay');
	})
}

function playVideo(){
	$('#mediaPlayer').get(0).play();
	console.log("PLAY");
}

function formatTagTypeOption(index){
	var tagType = ["Important","Examable", "Question", "Interesting", "General"];
	return "<option value='" + index + "'>" + tagType[index] + "</option>";
}


function loadTagTypes() {
	var tagType = $("#TagType");
	
	for(var i = 0; i <= 1; ++i) {
		tagType.append(formatTagTypeOption(i));
	}
}

function formatTagtype(value) {
	var color = ["green","yellow","pink","red","purple"];
	return color[value];

}

// start and end has to be matching with the UI timeline
// probabaly adding some offset value
function formatTimeline(tag){
	return "<div class='Tag' style='left: " + tag.start + "px; width: " + tag.end + "px; background: " + formatTagtype(tag.type) + ";' UUID='" + tag.uuid + "'>"			
}

function loadTags(uuid) {
	var timeline = $(".Tagger").children(".Timeline");		
		
	accent.getTagsByMediaFileId(uuid, function(data){
		var tagWindow = $(timeline).children(".TagWindow");		
		data.tags.forEach(function(tag) {				
			var tagStr = formatTimeline(tag);	
			tagWindow.before(tagStr);	

		});	
		bindTag($(".Tag"));
	});

}

function selectedTag(tag) {	
	var tagID = $(tag).attr('uuid');	
	
	accent.getTagById(tagID, function(data){
		alert(JSON.stringify(data.tag));
	});
	
}

function showTagInfo(title, description){
	var tagTitle = document.getElementById("TagTitle");		
	var tagType = document.getElementById("TagType");
	var tagDescription = document.getElementById("TagDescription");

	tagTitle.value = title;
	tagDescription.value = description;
	$(".TagWindow").show();
}

function bindTag(tag) {
	tag.bind("mousedown", function(evt) {
		evt.stopPropagation();
		if (!evt.shiftKey)
			$(this).parent().children().removeClass("Selected");
		$(this).addClass("Selected");

		if (evt.offsetX < 5) {
			$(this).parent().data("action", "resize-left");
		}
		else if (evt.offsetX > $(this).width()-5) {
			$(this).parent().data("action", "resize-right");
		}
		else {
			$(this).parent().data("action", "move");
		}		
		return true;
	}).bind("mouseup", function() {
		$(this).parent().data("action", false);

		var selectedTag = $(this);
		var tagID = selectedTag.attr("uuid");

		accent.getTagById(tagID, function(data){		
			if (data.tag) {
				showTagInfo(data.tag.title, data.tag.description);			
				console.log('should display something')
			}				
			else {
				showTagInfo("", "");
				console.log('should display nothing')
			}				

		})

		return true;
	}).bind("mousemove", function(evt) {
		if (evt.offsetX < 5) {
			$(this).parent().css("cursor", "w-resize");
		}
		else if (evt.offsetX > $(this).width()-5) {
			$(this).parent().css("cursor", "e-resize");
		}
		else {
			$(this).parent().css("cursor", "auto");
		}

		$(".TagWindow").css({
			opacity: 1.0,
			top: ($(this).position().top + $(this).height()) + "px",
			left: ($(this).position().left + $(this).width()/2 - $(".TagWindow").width()/2 - 9) + "px"
		})
	})
}

loadMedia(mediaID);
loadTags(mediaID);

$(document).ready(function () {	
	$(".Timeline").bind("dblclick", function(evt) {
		var offset = evt.offsetX;
		var tag = $('<div class="Tag" style="left: '+offset+'px; width: 12px; background: red;"></div>');
		console.log('should display nothing when d clicked')
		showTagInfo("","");

		tag.data("offset", offset)
		tag.prependTo($(this))
		bindTag(tag)
		tag.data("offset", offset)
		$(this).data("current-tag", tag)
	}).bind("mousedown", function(evt) {					
		$(this).data("last", evt.pageX);
		return true;
	}).bind("mousemove", function(evt) {
		var offset = evt.offsetX;
		switch($(this).data("action")) {
		case "move":
			var offset = evt.pageX - $(this).data("last");
			$(this).children(".Selected").each(function() {
				$(this).css({
					left: ($(this).position().left + offset) + "px"
				})
			})
			break;
		
		case "resize-left":
			var offset = evt.pageX - $(this).data("last");
			$(this).children(".Selected").each(function() {
				$(this).css({
					left: ($(this).position().left + offset) + "px",
					width: ($(this).width() - offset) + "px"
				})
			})
			break;
		
		case "resize-right":
			var offset = evt.pageX - $(this).data("last");
			$(this).children(".Selected").each(function() {
				$(this).css({
					width: ($(this).width() + offset) + "px"
				})
			})
			break;
		}

		$(this).data("last", evt.pageX);

	}).bind("mouseup", function() {
		$(this).data("current-tag", null);
	})


})
