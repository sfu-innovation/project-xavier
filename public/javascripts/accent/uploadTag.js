var common = new coreApi.Common();
var rqra = new coreApi.Presenter();

function uploadTag(tag){
	var tagNode = $(tag).parent().parent().children("div");
	//var tagTitle = $(tagNode).children("input#TagTitle");
	//var tagDescription = $(tagNode).children("textarea#TagDescription");
	var tagTitle = document.getElementById("TagTitle");
	var tagDescription = document.getElementById("TagDescription");

	console.log('upload tag now!');
	console.log(tagNode);
	console.log(tagTitle);
	console.log(tagDescription);
}



