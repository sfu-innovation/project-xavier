function timelineMouseOver(timeline, e) {
	var event = e || window.event;
	if (event.target !== timeline) {
		event.target.style.width='4.5em'; 
		event.target.style.color = 'rgba(255,255,255,255)';
	}
}

function timelineMouseOut(timeline, e) {
	var event = e || window.event;
	if (event.target !== timeline) {
		event.target.style.width = '0.8em'; 
		event.target.style.color = 'rgba(0,0,0,0)';
	}
}

function timelineClicked(timeline, e) {
	var event = e || window.event;
	if (event.target !== timeline) {
		HTMLCollection.prototype.indexOf = Array.prototype.indexOf;
		QuestionCommon.setWeek(event.target.parentNode.children.indexOf(event.target));
		QuestionList.refreshQuestionsList();
		QuestionCommon.refreshDefaultHeader();
	}
}