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
	var color = "";
	if (value === 0)
		color = "green";
	else
		color = "purple";
	return color;

}

function formatTagWindow(){
	return 	"<div class='TagWindow'>"
			+ "<div class='Type'>"
			+	"<label>Type:</label>"
			+	"<select>"
			+		"<option>Important</option>"
			+		"<option>Examable</option>"
			+		"<option>Question</option>"
			+		"<option>Interesting</option>"
			+		"<option>General</option>"
			+	"</select>"
			+"</div>"
			+"<div class='Title'>"
			+	"<label>Title:</label>"
			+	"<input type='text' placeholder='My Great Title'/>"
			+"</div>"
			+"<div class='Description'>"
			+	"<label>Description:</label>"
			+	"<textarea rows='6' cols='50'></textarea>"
			+"</div>"
			+"<div class='Buttons'>"
			+	"<input type='submit' value='Discard Changes'/>"
			+	"<input type='submit' value='Save Changes'/>"
			+"</div>"
			+"</div>";
}

// start and end has to be matching with the UI timeline
// probabaly adding some offset value
function formatTimeline(tag){
	return "<div class='Tag' style='left: " + (tag.start + 40) + "px; width: " + (tag.end  + 60) + "px; background: " + formatTagtype(tag.type) + ";' " + "onclick='return selectedTag(this);' " + "UUID='" + tag.uuid + "'>"			
}

function loadTags(uuid) {
	var tagger = $(".Tagger").children(".Timeline");
	
	/*
	accent.getTagsByMediaFileId(uuid, function(data){

		data.tags.forEach(function(tag) {	
			tagger.append(formatTimeline(tag));		
		});	

		// append tag window here
		tagger.append(formatTagWindow());

	});
	*/
	
	//loadTagTypes();
}

function selectedTag(tag) {	
	var tagID = $(tag).attr('uuid');	
	
	accent.getTagById(tagID, function(data){
		alert(JSON.stringify(data.tag));
	});
	
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




bindTag($(".Tag"));

loadMedia(mediaID);
//loadTags(mediaID);

$(document).ready(function () {
	console.log("always excuted");
	$(".Timeline").bind("dblclick", function(evt) {
		var offset = evt.offsetX;
		var tag = $('<div class="Tag" style="left: '+offset+'px; width: 12px; background: red;"></div>');
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
