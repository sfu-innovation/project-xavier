var accent = new coreApi.Accent();

var mediaID = $('#mediaUUID').text().replace(/^\s+|\s+$/g, '');
var video = document.getElementById("Video");

function loadMedia(){	
	accent.getMediaFileById(mediaID, function(data){
		$('#Video').attr('src', '/media/' + data.mediafile.path);
		$('#Video').attr('autoplay', 'autoplay');
		var mediaTitle = $("#Main").children("h1");
		mediaTitle.text(data.mediafile.title);

		accent.getMediaSection(mediaID, function(section){			
			var mediaSection = $("#Main").children("h2");
			mediaSection.text(section.section);
		})
	})			
}

function formatTagTypeOption(index){
	var tagType = ["Important","Examable", "Question", "Interesting", "General"];
	return "<option value='" + index + "'>" + tagType[index] + "</option>";
}


function formatTagtype(value) {
	var color = ["green","yellow","pink","red","purple"];
	return color[value];

}

// start and end has to be matching with the UI timeline
// probabaly adding some offset value
function formatTimeline(tag){
	console.log('tags fetching')
	console.log('tag start = ' + tag.start)
	console.log('tag end = ' + tag.end)
	return "<div class='Tag' style='left: " + convertTime2Pixel(tag.start) + "px; width: " + convertTime2Pixel(tag.end) + "px; background: " + formatTagtype(tag.type) + ";' UUID='" + tag.uuid + "'>"			
}

function convertTime2Pixel(time) {
	var videoWidth = $(".Timeline").width();	
	var pixel = time * videoWidth / video.duration;	

	console.log('pixel = ' + pixel)

	return pixel;
}

function displayTags(type) {
	var timeline = $(".Tagger").children(".Timeline");		
	accent.getTagsByMediaFileId(mediaID, function(data){		
		var tagWindow = $(timeline).children(".TagWindow");	
		if(type === "") {
			data.tags.forEach(function(tag) {				
				var tagStr = formatTimeline(tag);	
				tagWindow.before(tagStr);
			});
		}
		else {			
			data.tags.forEach(function(tag) {	
				if (tag.type === type) {
					var tagStr = formatTimeline(tag);	
					tagWindow.before(tagStr);		
				}						
			});	
		}

		bindTag($(".Tag"));
	});

}

function refreshTags(filterType){	
	var timeline = $(".Tagger").children(".Timeline");	
	timeline.find(".Tag").remove();

	switch(filterType) {
		case "All":
			displayTags(mediaID,"");
			break;
		case "Important":
			displayTags(mediaID,0);
			break;
		case "Examable":
			displayTags(mediaID,1);
			break;
		case "Question":
			displayTags(mediaID,2);
			break;
		case "Interesting":
			displayTags(mediaID,3);
			break;
		case "General":
			displayTags(mediaID,4);
			break;
	}
	
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
	tag.bind("dblclick", function(evt) {
		evt.stopPropagation();
		var tag = $(this).data("tag");
		video.pause();
		console.log('play here = ' + tag.offset)
		video.currentTime = tag.offset;
		if (tag.duration > 0)
			video.play();
	}).bind("mousedown", function(evt) {
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
			display: "block",
			top: ($(this).position().top + $(this).height()) + "px",
			left: ($(this).position().left + $(this).width()/2 - $(".TagWindow").width()/2 - 9) + "px"
		})
	})
}

function addTag(time) {
	var p = time/video.duration * 100;
	var tag = $('<div class="Tag" style="left: '+p+'%; width: 12px; background: red;"></div>');
	$(".Timeline").prepend(tag);
	tag.data("tag", {
		offset: time,
		duration: 0
	});
	bindTag(tag);
}

loadMedia();
//displayTags(mediaID, "");

$(document).ready(function () {		

	$(".Timeline").bind("dblclick", function(evt) {		
		//var offset = evt.offsetX;
		//var tag = $('<div class="Tag" style="left: '+offset+'px; width: 12px; background: red;"></div>');	
		console.log('evt X = ' + evt.offsetX)
		console.log('dbl click = ' + (evt.offsetX / $(this).width() * video.duration))	
		var tag = addTag(evt.offsetX / $(this).width() * video.duration);
		console.log('should display nothing when d clicked')
		showTagInfo("","");

		//tag.data("offset", offset)
		//tag.prependTo($(this))
		//bindTag(tag)
		//tag.data("offset", offset)
		$(this).data("current-tag", tag)
	}).bind("mousedown", function(evt) {					
		$(this).data("last", evt.pageX);
		return true;
	}).bind("mousemove", function(evt) {
		var offset = evt.offsetX;

		if (evt.which !== 1)
			return;

		switch($(this).data("action")) {
		case "move":
			var offset = evt.pageX - $(this).data("last");
			$(this).children(".Selected").each(function() {
				var 
					r = ($(this).position().left + offset) / $(this).parent().width(),
					x = Math.max(r,0),
					tag = $(this).data("tag"),
					q = tag.duration/video.duration,
					y = Math.min(r + q, 1),
					z = y - q,
					w = y != r + q ? z : x;

				tag.offset = w * video.duration;

				$(this).css({
					left: (w*100) + "%"
				})
			})
			break;
		
		case "resize-left":
			var offset = evt.pageX - $(this).data("last");

			$(this).children(".Selected").each(function() {
				var 
					x = Math.max(($(this).position().left + offset) / $(this).parent().width(), 0),
					duration = ($(this).width() - offset) / $(this).parent().width();

				var tag = $(this).data("tag");
				tag.offset = x * video.duration;
				tag.duration = duration * video.duration;

				$(this).css({
					left: (x*100) + "%",
					width: (duration*100) + "%"
				})
			})

			break;
		
		case "resize-right":
			var offset = evt.pageX - $(this).data("last");
			$(this).children(".Selected").each(function() {

				var 
					duration = ($(this).width() + offset) / $(this).parent().width(),
					tag = $(this).data("tag");
				
				tag.duration = duration * video.duration;

				$(this).css({
					width: (duration*100) + "%"
				})
			})
			break;
		}

		$(this).data("last", evt.pageX);

	}).bind("mouseup", function() {
		$(this).data("current-tag", null);
	})

	bindTag($(".Tag"));
				
	$(video).on("play", function() {
		$(".Play").data("action", "pause")
			.children("img").attr("src","../../images/accent/pause.png");
	}).on("pause", function() {
		$(".Play").data("action", "play")
			.children("img").attr("src","../../images/accent/play.png");
	}).on("timeupdate", function() {
		var progress = this.currentTime / this.duration;
		$(".Scrubber").css({
			left: (progress*100) + "%"
		})

	})

	$(".Controls .Timeline").bind("click", function(evt) {
		var progress = evt.offsetX / $(this).width();

		video.currentTime = video.duration*progress;
	}).bind("mousemove", function(evt) {
		if (evt.which !== 1)
			return;

		if (evt.srcElement !== this)
			return;

		var progress = evt.offsetX / $(this).width();

		video.currentTime = video.duration*progress;
		return false;
	
	})

	$(".Play").bind("click", function() {
		switch($(this).data("action")) {
		case "play":
			video.play();
			break;
		case "pause":
			video.pause();
			break;
		}
		return false;
	})

	$(".Volume > a").bind("click", function() {
		//COde here
		var i = $(this).parent().children(".Input");

		if (!i.is(":visible")) {
			i.show();
			$(document).one("click", function() {
				i.hide();
			})
		}
		else
			i.hide();

		
		return false;
	})

	$(".Commands > a").bind("click", function() {
		//COde here
		var i = $(this).parent().children("ul");

		if (!i.is(":visible")) {
			i.show();
			$(document).one("click", function() {
				i.hide();
			})
		}
		else
			i.hide();

		
		return false;
	})

	$(".Volume input").bind("change", function() {
		video.volume = 1.0 - $(this).val();
	}).bind("click", function(evt) {
		evt.preventDefault();
		return false;
	})

	$(".TagHere").bind("click", function() {
		addTag(video.currentTime)
		return false;
	})


})
