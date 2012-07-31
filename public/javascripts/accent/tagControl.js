var common = new coreApi.Common();
//var rqra = new coreApi.Presenter();
var accent = new coreApi.Accent();

function getTagType(value) {
	return 1;
}

function deleteTag(tag){
	var selectedTag = $(".Tag.Selected");
	var tagger = $(".Tag.Selected").parent();
	var tagID = selectedTag.attr('UUID');	
	
	if (tagID) {
		accent.deleteTagById(tagID, function(data){});
	}

	tagger.find(".Tag.Selected").remove();
	$(".TagWindow").hide();

	
}

function uploadTag(tag){
	var selectedTag = $(".Tag.Selected");
	
	var tagStart = parseInt(selectedTag.css('left'));
	var tagEnd = parseInt(selectedTag.css('width'));
	
	var tagTitle = document.getElementById("TagTitle").value;
	var tagTarget = $('#mediaUUID').text().replace(/^\s+|\s+$/g, '');
	var tagType = document.getElementById("TagType").value;
	var tagDescription = document.getElementById("TagDescription").value;

	console.log('tag selected');
	console.log(selectedTag);

	var tag = {				
		user:"",
		start:0,
		end:0,			
		type:1,
		target:"",
		title:"",
		description:"",
		question:"",
		important:false,
		interest:false,
		examable:false,
		reviewlater:false,
		shared:false
	};

	var sessionUser = $("#Session .Components a.UUID").text().replace(/^\s+|\s+$/g, '');	
	tag.user = sessionUser;
	tag.start = tagStart;
	tag.end = tagEnd;
	tag.target = tagTarget;
	tag.title = tagTitle;
	tag.description = tagDescription;	

	switch(tagType) {
		case 'Important':{
			tag.interest = true;
			break;
		}
		case 'Examable':{
			tag.examable = true;
			break;
		}
		case 'Question':{
			tag.type = 0;
			break;
		}
		case 'Interesting':{
			tag.interest = true;
			break;
		}
		case 'General':{
			tag.shared = true;
			break;
		}
	}

	
	accent.createTag(tag,function(data){
		// put tag timelines dynamically		
		selectedTag.attr('UUID', data.tag.uuid);
		$(".TagWindow").hide();
	});		

}



